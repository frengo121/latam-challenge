# Commit Helper

Creates a well-formed git commit following this project's conventions.

## Convention
`type(scope): description`

Types: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `style`
Scopes: `core`, `users`, `shared`, `shell`, `routing`

## Steps

1. Run `git diff --staged` to see what's staged
2. Run `git status` to see what's unstaged
3. Infer a commit message from the changes
4. Stage relevant files (prefer specific paths over `git add -A`)
5. Commit with the message following the convention above
6. Do NOT include "Co-Authored-By" or any AI attribution in the message

## Rules
- Message must be under 72 characters
- Use imperative mood: "add", "fix", "update" — not "added" or "fixes"
- Do not add a period at the end
- If changes span multiple concerns, split into multiple commits
