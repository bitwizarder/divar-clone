Build Error



Error evaluating Node.js code
./app/styles/globals.css

Error: Error evaluating Node.js code
CssSyntaxError: tailwindcss: C:\Users\drmhd\OneDrive\Desktop\divar-front-ts\app\styles\globals.css:1:1: Can't resolve 'ckeditor-react-wrapper/dist/index.css' in 'C:\Users\drmhd\OneDrive\Desktop\divar-front-ts\app\styles'
    [at Input.error (turbopack:///[project]/node_modules/postcss/lib/input.js:135:16)]
    [at Root.error (turbopack:///[project]/node_modules/postcss/lib/node.js:166:32)]
    [at Object.Once (C:\Users\drmhd\OneDrive\Desktop\divar-front-ts\node_modules\@tailwindcss\postcss\dist\index.js:10:7013)]
    [at process.processTicksAndRejections (node:internal/process/task_queues:103:5)]
    [at async LazyResult.runAsync (turbopack:///[project]/node_modules/postcss/lib/lazy-result.js:299:11)]
    [at async transform (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:70:34)]
    [at async run (turbopack:///[turbopack-node]/child_process/evaluate.ts:89:23)]

Import traces:
  #1 [Client Component Browser]:
    ./app/styles/globals.css [Client Component Browser]
    ./app/(site)/layout.tsx [Server Component]

  #2 [Client Component Browser]:
    ./app/styles/globals.css [Client Component Browser]