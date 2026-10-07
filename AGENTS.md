<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture

- Keep the mutable product name in `src/config/brand.ts` so rebranding remains a one-line change.
- Keep typed mock inventory and asynchronous data access in `src/services/`; route components consume the service contract rather than fixtures directly.
- Keep shared buyer navigation in the TanStack root route and each shareable screen in its own route file for SSR metadata and typed navigation.
- Keep reusable visual primitives, ticket anatomy, and seat-map interactions in `src/components/` so the style guide and product screens share one implementation.
