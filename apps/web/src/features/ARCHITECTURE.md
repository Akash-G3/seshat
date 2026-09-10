# Seshat frontend architecture

The workspace UI is split into four application-level pieces:

- `workspace/` — workspace data, mutations, and the page that coordinates the shell.
- `workspaceHeader/` — workspace name and open-note tabs.
- `activityBar/` — global workspace actions.
- `library/` — notebooks and notes tree.
- `editor/` — existing BlockNote editor; intentionally left unchanged.

## State ownership

UI state such as open tabs, active note, library visibility, notebook expansion,
menus, and dialogs belongs to the frontend.

Persistent entities and actions such as notes, notebooks, workspace names,
renames, creates, and deletes go through the existing workspace API/hooks.

## Adding a new ActivityBar action

1. Create its component under `activityBar/components/<ActionName>/`.
2. Keep the component presentational: accept an `onClick` callback.
3. Wire the callback in `features/workspace/pages/workspace.tsx`.
4. Put API calls in the existing feature API/mutation layer, not inside the icon component.

## Adding Library row actions

Keep row menus presentational. The page owns the mutation callbacks. This makes
future features such as move, favourites, trash, and sharing easy to add without
coupling the Library to backend implementation details.
