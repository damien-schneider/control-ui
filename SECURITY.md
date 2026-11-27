# Security policy

## Supported versions

Control UI is in alpha. Fixes land on `main` and ship in the next `@ctrl-ui/react` release and registry update. Older versions do not get patches, so upgrade to the latest release to pick up a fix.

## Reporting a vulnerability

Report it privately through [GitHub's vulnerability reporting](https://github.com/damien-schneider/control-ui/security/advisories/new). Do not open a public issue.

Include the affected component, registry item, or docs route, the version or commit, and steps to reproduce. The conversation stays in the private advisory until a fix ships; the published advisory credits you unless you prefer to stay anonymous.

Relevant reports include markup injection through component props, unsafe handling of user content in the markdown and code components, and anything in the registry payloads or install scripts that could run code you did not ask for.
