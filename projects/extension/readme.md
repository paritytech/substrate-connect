# Extension

## Getting started
Navigate to the project directory and install the dependencies.

```
$ yarn
```

To build the extension, and rebuild it when the files are changed, run

- Open a terminal and run
```
$  yarn run dev
```
This will initiate a "watch" terminal that will hot reload in every change (Changes polling: 1 second. Aggregation of changes: every 1 second.)

After the project has been built, a directory named `dist` has been created.
### 1st (best) way:
1. Open another terminal and run
- For dev mode on chrome:
```
$  yarn run start
```
- For dev mode on Firefox:
```
$  yarn run start:firefox
```

### 2nd way:
1. Open Chrome
2. Navigate to `chrome://extensions`.
3. Enable _Developer mode_.
4. Click _Load unpacked_.
5. Select the `dist` directory.
(This requires reload of the extension every time a change is made)
