// PreToolUse guardrail: blocks edits to secret or generated files and destructive shell commands.
// Exit 2 blocks the tool call and shows stderr to the agent. Malformed input is allowed,
// so a guard bug cannot stop all work.
import { readFileSync } from 'node:fs';
import { basename, isAbsolute, relative, resolve } from 'node:path';

const GENERATED_DIRS = ['out', '.next', 'node_modules'];
const PROTECTED_DIRS = ['.git', '.claude', 'app', 'components', 'docs', 'evals', 'lib', 'public', 'scripts', 'tests'];

function block(reason) {
  console.error(`Blocked by .claude/hooks/guard.mjs: ${reason}`);
  process.exit(2);
}

function checkFile(filePath, projectDir) {
  const absolute = isAbsolute(filePath) ? filePath : resolve(projectDir, filePath);
  const path = relative(projectDir, absolute);
  if (path.startsWith('..') || isAbsolute(path)) return;

  const name = basename(path);
  if (/^\.env(\..+)?$/.test(name) && name !== '.env.example') {
    block(`${path} may hold secrets; ask the user to edit it.`);
  }
  if (GENERATED_DIRS.includes(path.split(/[/\\]/)[0])) {
    block(`${path} is generated output; change its source instead.`);
  }
}

/** Splits a shell command into argument lists, keeping quoted text inside one argument. */
function parseSegments(command) {
  const tokenPattern = /"(?:\\.|[^"\\])*"|'[^']*'|&&|\|\||[;|\n]|[^\s;|&"']+/g;
  const segments = [[]];
  for (const token of command.match(tokenPattern) ?? []) {
    if (['&&', '||', ';', '|', '\n'].includes(token)) segments.push([]);
    else segments.at(-1).push(token.replace(/^(["'])(.*)\1$/s, '$2'));
  }
  return segments.map((args) => {
    let start = 0;
    while (/^[A-Za-z_][A-Za-z0-9_]*=/.test(args[start] ?? '')) start += 1;
    return args.slice(start);
  });
}

const hasShortFlag = (arg, flag) => /^-[a-zA-Z]+$/.test(arg) && arg.includes(flag);

function checkGit(args) {
  const rest = args.slice(1);
  while (['-c', '-C'].includes(rest[0])) rest.splice(0, 2);
  const [subcommand, ...flags] = rest;

  if (subcommand === 'push' && flags.some((a) => a === '--force' || hasShortFlag(a, 'f') || a.startsWith('+'))) {
    block('force push rewrites shared history; use --force-with-lease after asking the user.');
  }
  if (subcommand === 'reset' && flags.includes('--hard')) {
    block('git reset --hard discards uncommitted work; ask the user first.');
  }
  if (subcommand === 'clean' && flags.some((a) => a === '--force' || hasShortFlag(a, 'f'))) {
    block('git clean deletes untracked files; ask the user first.');
  }
}

function checkRm(args, projectDir) {
  const flags = args.slice(1).filter((a) => a.startsWith('-'));
  const targets = args.slice(1).filter((a) => !a.startsWith('-'));
  if (!flags.some((a) => a === '--recursive' || hasShortFlag(a, 'r') || hasShortFlag(a, 'R'))) return;

  for (const target of targets) {
    const path = relative(projectDir, resolve(projectDir, target));
    const isProjectOrAncestor = path === '' || /^(\.\.[/\\]?)+$/.test(path);
    if (['/', '~', '*'].includes(target) || isProjectOrAncestor || PROTECTED_DIRS.includes(path.split(/[/\\]/)[0])) {
      block(`recursive delete of ${target} removes project source or evidence; ask the user first.`);
    }
  }
}

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

const toolInput = input.tool_input ?? {};
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();

if (input.tool_name === 'Bash') {
  for (const args of parseSegments(String(toolInput.command ?? ''))) {
    if (args[0] === 'git') checkGit(args);
    if (args[0] === 'rm') checkRm(args, projectDir);
  }
} else {
  const filePath = toolInput.file_path ?? toolInput.notebook_path;
  if (typeof filePath === 'string') checkFile(filePath, projectDir);
}
