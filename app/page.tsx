export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 dark:bg-black">
      <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
        Hello World
      </h1>
      <ul className="list-disc space-y-2 text-zinc-700 dark:text-zinc-300">
        <li>Works directly in your terminal, fitting into existing workflows</li>
        <li>Understands and navigates large codebases automatically</li>
        <li>Executes multi-step tasks: editing files, running tests, fixing bugs</li>
        <li>Integrates with git for commits, branches, and pull requests</li>
        <li>Extensible via MCP servers, hooks, and custom slash commands</li>
        <li>Built-in support for planning, code review, and security checks</li>
      </ul>
    </div>
  );
}
