## 2.23.1

2021-10-15

### 🐛 BugFix

- Fix the bug that the `Typography` component will be parsed into an array when multiple dynamic strings are wrapped.
- Fix the bug that the `Typography` component will throw an error in the `editing` state after setting `ellipsis`.

## 2.23.0

2021-09-27

### 💎 Optimization

- Optimize the calculation timing in the case of `Typography` ellipsised.

### 🐛 BugFix

- Fix the bug of `Typography` component truncating English characters, causing text overflow.

## 2.22.0

2021-09-10

### 🐛 BugFix

- Fix text display width calculation error of `Typography` in `flex` mode
-  Fix the bug that the `Typography` component `ellipsis` cannot be re-rendered when the `ellipsis` is under control
-  Fix the bug that the call of `Typography` component `ellipsis` cannot be triggered when passing `onExpand`
-  Fix the bug that the status of `ellipsis` cannot be automatically updated according to the taste when `resize` of the `Typography` window

## 2.20.1

2021-08-06

### 🐛 Bugfix

- Fix the bug that the `Typography` component does not support the native `dom` attribute.
- Fix the bug that the `Typography` component sometimes jitters when it is rendered for the first time.

### 🆎 TypeScript

- Modify the `ellipsis.showTooltip.props` of the `Typography` component to be optional.



## 2.19.1

2021-07-18

### 🐛 Bugfix

- Fix the bug that the copy function of `Typography` component does not work in Android webview.



## 2.19.0

2021-07-16

### 🐛 Bugfix

- Fix the bug that the copy function of `Typography` component does not work in Android webview.

## 2.14.1

2021-04-16

### 🐛 Bugfix

- Fix the bug that the copy function of `Typography` component does not work on the Android system browser.

