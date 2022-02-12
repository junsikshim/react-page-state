# react-page-state

A page consistutes of multiple modes/phases depending on user interactions, API calls, and/or internal states.
Relying on many state variables often leads to error-prone implementation.
`react-page-state` introduces `PageState`s to divide a page into non-overlapping parts and make transitions among them.
In contrast to FSMs, the `PageState`s can be combined into one, so that duplicated codes can be minimal.
Also, `PageStateSwitch` allows you to render declaratively based on the current page state.

*Work in progress*
