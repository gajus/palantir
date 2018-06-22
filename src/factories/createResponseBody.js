// @flow

export default (
  // eslint-disable-next-line flowtype/no-weak-types
  config: Object,
  deferredScriptUrls: $ReadOnlyArray<string>,
  styleUrls: $ReadOnlyArray<string>,
  head: string = ''
) => {
  const scripts = deferredScriptUrls
    .map((deferredScriptUrl) => {
      return `<script defer='defer' src='${deferredScriptUrl}'></script>`;
    })
    .join('\n');

  const styles = styleUrls
    .map((styleUrl) => {
      return `<link href='${styleUrl}' rel='stylesheet' />`;
    })
    .join('\n');

  const globalState = {
    config
  };

  return `
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='utf-8'>

    ${styles}

    <script>
    window.PALANTIR = ${JSON.stringify(globalState)};
    </script>

    <link href='${config.BASE_PATH}manifest.json' rel='manifest'>

    ${scripts}

    <link rel='icon' type='image/png' href='${config.BASE_PATH}static/favicon.png'>

    <meta content='width=device-width, initial-scale=1, user-scalable=no' name='viewport'>

    ${head}
  </head>
  <body>
    <div id='app'></div>
  </body>
</html>
  `;
};
