import { auditTheme } from "../app/(features)/theme-accessibility/audit-theme";

Object.assign(window, {
  runControlUiThemeAudit: () => auditTheme(document.documentElement),
});
