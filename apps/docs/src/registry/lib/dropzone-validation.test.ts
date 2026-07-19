import { describe, expect, test } from "bun:test";

import {
  compileDropzoneAccept,
  DropzoneErrorCode,
  formatDropzoneFileSize,
  getDropzoneDragVerdict,
  isDropzoneFileAccepted,
  normalizeDropzoneAccept,
  normalizeDropzoneMaxFiles,
  processDropzoneFiles,
  validateDropzoneFile,
} from "./dropzone-validation";

type FileFixtureOptions = {
  content?: string;
  type?: string;
  lastModified?: number;
  path?: string;
};

function makeFile(name: string, options: FileFixtureOptions = {}) {
  const file = new File([options.content ?? "file"], name, {
    type: options.type ?? "",
    lastModified: options.lastModified ?? 1,
  });
  if (options.path) Object.defineProperty(file, "webkitRelativePath", { value: options.path });
  return file;
}

function activeSignal() {
  return new AbortController().signal;
}

describe("dropzone accept policy", () => {
  test("normalizes accept entries and compiles the native accept value", () => {
    const accept = {
      " IMAGE/PNG ": [" PNG ", ".JpG", "", "png"],
      " text/plain ": [],
      " ": [" CSS "],
      "application/empty": ["  "],
      "  ": [],
    };

    expect(normalizeDropzoneAccept(accept)).toEqual([
      { mime: "image/png", extensions: [".png", ".jpg"] },
      { mime: "text/plain", extensions: [] },
      { mime: "", extensions: [".css"] },
      { mime: "application/empty", extensions: [] },
    ]);
    expect(compileDropzoneAccept(accept)).toBe(".png,.jpg,text/plain,.css,application/empty");
    expect(compileDropzoneAccept({ " ": ["", "  "] })).toBeUndefined();
  });

  test("matches exact and wildcard MIME entries case-insensitively", () => {
    expect(
      isDropzoneFileAccepted(makeFile("data.bin", { type: "APPLICATION/JSON" }), {
        "application/json": [],
      }),
    ).toBe(true);
    expect(
      isDropzoneFileAccepted(makeFile("photo.bin", { type: "IMAGE/PNG" }), {
        "image/*": [],
      }),
    ).toBe(true);
    expect(
      isDropzoneFileAccepted(makeFile("data.bin", { type: "text/plain" }), {
        "application/json": [],
      }),
    ).toBe(false);
  });

  test("requires configured extensions and supports empty MIME metadata", () => {
    const accept = { "image/png": ["PNG"] };
    expect(isDropzoneFileAccepted(makeFile("PHOTO.PNG"), accept)).toBe(true);
    expect(isDropzoneFileAccepted(makeFile("photo.txt", { type: "image/png" }), accept)).toBe(false);
    expect(isDropzoneFileAccepted(makeFile("anything.exe"), undefined)).toBe(true);
    expect(isDropzoneFileAccepted(makeFile("anything.exe"), { " ": [] })).toBe(true);
  });
});

describe("dropzone validation", () => {
  test("accumulates built-in errors with stable messages before custom errors", async () => {
    const file = makeFile("payload.exe", {
      content: "data",
      type: "application/x-msdownload",
    });
    const errors = await validateDropzoneFile(
      file,
      {
        accept: { "image/png": [".png"] },
        minSize: 5,
        maxSize: 3,
        validator: () => ({ code: "malware", message: "Custom failure." }),
      },
      activeSignal(),
    );

    expect(errors).toEqual([
      { code: DropzoneErrorCode.FileInvalidType, message: "File type is not accepted." },
      { code: DropzoneErrorCode.FileTooSmall, message: "File is smaller than the 5 B minimum." },
      { code: DropzoneErrorCode.FileTooLarge, message: "File is larger than the 3 B limit." },
      { code: "malware", message: "Custom failure." },
    ]);
  });

  test("accepts synchronous and asynchronous validator lists once per file", async () => {
    let calls = 0;
    const syncErrors = await validateDropzoneFile(
      makeFile("one.txt"),
      {
        validator: () => {
          calls += 1;
          return [
            { code: "first", message: "First." },
            { code: "second", message: "Second." },
          ];
        },
      },
      activeSignal(),
    );
    const asyncErrors = await validateDropzoneFile(
      makeFile("two.txt"),
      {
        validator: async () => {
          calls += 1;
          await Promise.resolve();
          return [{ code: "async", message: "Async." }];
        },
      },
      activeSignal(),
    );

    expect(syncErrors.map((error) => error.code)).toEqual(["first", "second"]);
    expect(asyncErrors).toEqual([{ code: "async", message: "Async." }]);
    expect(calls).toBe(2);
  });

  test("propagates live validator failures and aborts", async () => {
    await expect(
      validateDropzoneFile(makeFile("broken.json"), { validator: () => Promise.reject(new Error("validator failed")) }, activeSignal()),
    ).rejects.toThrow("validator failed");

    const controller = new AbortController();
    controller.abort();
    await expect(validateDropzoneFile(makeFile("aborted.json"), { validator: () => null }, controller.signal)).rejects.toHaveProperty(
      "name",
      "AbortError",
    );
  });

  test("formats file sizes from bytes through terabytes", () => {
    expect(formatDropzoneFileSize(Number.NaN)).toBe("0 B");
    expect(formatDropzoneFileSize(-10)).toBe("0 B");
    expect(formatDropzoneFileSize(0)).toBe("0 B");
    expect(formatDropzoneFileSize(1023)).toBe("1023 B");
    expect(formatDropzoneFileSize(1024)).toBe("1 KB");
    expect(formatDropzoneFileSize(1536)).toBe("1.5 KB");
    expect(formatDropzoneFileSize(1024 ** 4)).toBe("1 TB");
  });
});

describe("dropzone drag verdict", () => {
  const accepted = makeFile("photo.png", { type: "image/png", lastModified: 2 });
  const rejected = makeFile("script.exe", { type: "application/x-msdownload", lastModified: 3 });
  const policy = { accept: { "image/png": [".png"] }, maxFiles: 2 };

  test("returns accept and reject for known built-in metadata", () => {
    expect(getDropzoneDragVerdict([accepted], [], policy)).toBe("accept");
    expect(getDropzoneDragVerdict([rejected], [], policy)).toBe("reject");
    expect(getDropzoneDragVerdict([accepted], [accepted, rejected], policy)).toBe("reject");
  });

  test("returns unknown when metadata or pre-drop validation is unavailable", () => {
    expect(getDropzoneDragVerdict(null, [], policy)).toBe("unknown");
    expect(
      getDropzoneDragVerdict([{ type: "image/png" }], [], {
        accept: { "image/png": [".png"] },
      }),
    ).toBe("unknown");
    expect(getDropzoneDragVerdict([accepted], [], { ...policy, validator: () => null })).toBe("unknown");
    expect(getDropzoneDragVerdict([accepted], [], policy, { customExtraction: true })).toBe("unknown");
  });
});

describe("dropzone selection reconciliation", () => {
  test("preserves append and replace input order", async () => {
    const current = [makeFile("current.txt")];
    const first = makeFile("first.txt", { lastModified: 2 });
    const second = makeFile("second.txt", { lastModified: 3 });

    const appended = await processDropzoneFiles([first, second], current, undefined, activeSignal());
    expect(appended.acceptedFiles).toEqual([first, second]);
    expect(appended.value).toEqual([current[0], first, second]);
    expect(appended.removedFiles).toEqual([]);

    const replaced = await processDropzoneFiles([first, second], current, { selectionMode: "replace" }, activeSignal());
    expect(replaced.value).toEqual([first, second]);
    expect(replaced.removedFiles).toEqual(current);
  });

  test("uses webkitRelativePath in duplicate identity", async () => {
    const current = makeFile("config.json", {
      content: "{}",
      type: "application/json",
      lastModified: 4,
      path: "one/config.json",
    });
    const duplicate = makeFile("config.json", {
      content: "{}",
      type: "application/json",
      lastModified: 4,
      path: "one/config.json",
    });
    const distinctPath = makeFile("config.json", {
      content: "{}",
      type: "application/json",
      lastModified: 4,
      path: "two/config.json",
    });

    const result = await processDropzoneFiles([duplicate, distinctPath], [current], undefined, activeSignal());
    expect(result.acceptedFiles).toEqual([distinctPath]);
    expect(result.fileRejections).toEqual([
      {
        file: duplicate,
        errors: [
          {
            code: DropzoneErrorCode.FileAlreadySelected,
            message: 'File "config.json" is already selected.',
          },
        ],
      },
    ]);
  });

  test("allows duplicate identities when configured", async () => {
    const file = makeFile("same.txt");
    const duplicate = makeFile("same.txt");
    const result = await processDropzoneFiles([duplicate], [file], { allowDuplicates: true }, activeSignal());
    expect(result.value).toEqual([file, duplicate]);
    expect(result.fileRejections).toEqual([]);
  });

  test("accepts up to aggregate capacity and rejects each overflow", async () => {
    const current = makeFile("current.txt");
    const accepted = makeFile("accepted.txt", { lastModified: 2 });
    const overflow = makeFile("overflow.txt", { lastModified: 3 });
    const result = await processDropzoneFiles([accepted, overflow], [current], { maxFiles: 2 }, activeSignal());

    expect(result.acceptedFiles).toEqual([accepted]);
    expect(result.value).toEqual([current, accepted]);
    expect(result.fileRejections).toEqual([
      {
        file: overflow,
        errors: [{ code: DropzoneErrorCode.TooManyFiles, message: "Too many files." }],
      },
    ]);
  });

  test.each([
    [0.5, 1],
    [1.9, 1],
    [-1, Number.POSITIVE_INFINITY],
    [Number.NaN, Number.POSITIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ])("normalizes maxFiles %p to %p", (maxFiles, expected) => {
    expect(normalizeDropzoneMaxFiles(maxFiles)).toBe(expected);
  });

  test("treats non-positive and non-finite capacity as unlimited", async () => {
    const files = [makeFile("one.txt"), makeFile("two.txt", { lastModified: 2 }), makeFile("three.txt", { lastModified: 3 })];
    for (const maxFiles of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = await processDropzoneFiles(files, [], { maxFiles }, activeSignal());
      expect(result.acceptedFiles).toEqual(files);
    }
  });

  test("multiple false forces replace mode and one-file capacity", async () => {
    const current = makeFile("current.txt");
    const first = makeFile("first.txt", { lastModified: 2 });
    const overflow = makeFile("overflow.txt", { lastModified: 3 });
    const result = await processDropzoneFiles(
      [first, overflow],
      [current],
      { multiple: false, selectionMode: "append", maxFiles: 10 },
      activeSignal(),
    );

    expect(result.acceptedFiles).toEqual([first]);
    expect(result.value).toEqual([first]);
    expect(result.removedFiles).toEqual([current]);
    expect(result.fileRejections[0]?.errors[0]).toEqual({
      code: DropzoneErrorCode.TooManyFiles,
      message: "Too many files.",
    });
  });

  test("preserves the prior value after a fully rejected replace", async () => {
    const current = [makeFile("current.png", { type: "image/png" })];
    const rejected = makeFile("rejected.exe", { type: "application/x-msdownload" });
    const result = await processDropzoneFiles(
      [rejected],
      current,
      { selectionMode: "replace", accept: { "image/png": [".png"] } },
      activeSignal(),
    );

    expect(result.acceptedFiles).toEqual([]);
    expect(result.value).toBe(current);
    expect(result.removedFiles).toEqual([]);
    expect(result.fileRejections[0]?.errors[0]).toEqual({
      code: DropzoneErrorCode.FileInvalidType,
      message: "File type is not accepted.",
    });
  });
});
