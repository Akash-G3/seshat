# Seshat frontend wiring: Tags, Export, Trash and Share

This `src/` is a drop-in frontend source tree based on the uploaded web source.

## Backend contracts used

- `GET /tags?workspaceId=...`
- `POST /tags`
- `PATCH /tags/:id`
- `DELETE /tags/:id`
- `GET /tags/note/:noteId`
- `POST /tags/note/:noteId`
- `DELETE /tags/note/:noteId/:tagId`
- `GET /trash?workspaceId=...`
- `POST /trash`
- `POST /trash/restore`
- `DELETE /trash/item`
- `DELETE /trash`
- `GET /share`
- `POST /share`
- `DELETE /share/:id`
- `GET /share/public/:token`
- `POST /export/notes/:id/copy`
- `GET /export/notes/:id/export?format=md|json`
- `POST /export/notebooks/:id/copy`

## UX

- Tags: activity-bar entry -> Tags management view; note editor has inline tag picker.
- Trash: activity-bar entry -> Trash view; restore and permanent delete are separated.
- Share: item action menu and note action bar -> share dialog; creates/revokes public links and copies the generated URL.
- Export: note action menu and note action bar -> Markdown/JSON chooser.
- Copy: note/notebook action menus -> independent copy dialog with destination notebook selection.
- Public shares: `/share/:token` is intentionally outside the protected workspace route.

## Important

The uploaded archive did not include the application's `package.json`/`node_modules`, so dependency installation/build verification must be run in the real project. No new npm dependency is required by these changes; they use the existing React, TanStack Query, Axios, Lucide and BlockNote stack.
