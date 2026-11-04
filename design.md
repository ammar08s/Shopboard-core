# ShopBoard Design

Shared select controls and option-menu styling are specified below in [Selection component design](#selection-component-design) and implemented in `src/styles/selects.css`.

Status: Draft design specification, ready for review before implementation.

Reference: the user-provided desktop screenshot of a Hepsiburada product listing page. This document is based on that image and the existing ShopBoard project; it does not claim to describe the reference site's source code or unseen screens.

## 1. Goal and direction

Give ShopBoard the reference's marketplace appearance: a bright white background, orange identity, prominent search, organized category navigation, a filter sidebar, and an image-led product grid.

The main task is to help shoppers find a product, compare its price and availability, and add it to their cart. Product discovery should be the focus of the first screen. The proposed storefront replaces the current large promotional hero with the catalog layout below.

Use ShopBoard's name, existing products, images, English interface, and USD prices. The reference's Turkish wording, scanner catalog, brand logo, and product count describe that screenshot; they are not replacement ShopBoard data.

## 2. What is visible in the reference

From top to bottom, the screenshot shows:

1. A narrow row of utility links above the main header controls.
2. A large orange wordmark on the left, a wide search field in the middle, and location, account, and cart controls on the right.
3. A thin decorative strip divided into orange, cyan, purple, green, and dark-purple segments.
4. A light-gray category navigation bar with bold labels and vertical separators.
5. A two-column catalog layout: a narrow filter sidebar and a much wider results area.
6. Selected filter chips, a clear action, a delivery toggle, and the start of a brand filter section in the sidebar.
7. Breadcrumbs, a category heading with a product count, and a sorting control above the results.
8. A bordered price-range panel with pill-shaped options and previous/next arrow buttons.
9. Four product cards across the visible results row. Large product photos dominate the cards; heart buttons and promotional badges sit over some images.

The screenshot cuts off the lower portions of the cards. Product names, prices, purchase buttons, the footer, opened menus, and mobile layouts cannot be established from this image. Specifications for those areas below are ShopBoard proposals.

The screenshot also contains horizontal page scrolling. Treat this as a condition to improve: the ShopBoard page should fit its viewport, with scrolling limited to individual navigation or chip rows when needed.

## 3. Desktop layout

The following is the proposed ShopBoard arrangement, based on the reference:

```text
Utility links
-------------------------------------------------------------------
ShopBoard       [ Search products........................ ] Account Cart
===================================================================
All products       Bags       Shoes       Accessories
-------------------------------------------------------------------
                    Home / Collection / Selected category
                    Collection title + result count     [ Sort by ]
+----------------+  +---------------------------------------------+
| Active filters |  | Optional price options in a later phase      |
| Clear filters  |  +---------------------------------------------+
|                |
| Categories     |  +----------+ +----------+ +----------+ +----------+
|                |  | Product  | | Product  | | Product  | | Product  |
| Other filters  |  | image    | | image    | | image    | | image    |
| only when      |  | Name     | | Name     | | Name     | | Name     |
| supported      |  | Price    | | Price    | | Price    | | Price    |
+----------------+  | Add      | | Add      | | Add      | | Add      |
                    +----------+ +----------+ +----------+ +----------+
```

Proposed dimensions are implementation starting points, not measurements of the original website:

- Use a centered content container with a maximum width of approximately 1800px.
- Use 16px outer gutters on small screens, increasing to 24-40px as space allows.
- At wide desktop sizes, allocate approximately 260-300px to the filter sidebar.
- Use a 24-32px gap between the sidebar and results.
- Give the results column `min-width: 0` so its contents cannot force the page wider.
- Use four product columns only when each card has sufficient room; use three at narrower desktop widths.
- Align the sidebar, results controls, and cards to a consistent spacing grid.
- Keep the results title visually stronger than labels and breadcrumbs.

## 4. Header and navigation

### Reference appearance

The reference header is wide, white, and divided into clear horizontal bands. Its search control has an orange outline, a leading search icon, rounded corners, and a thin multicolor detail along the bottom. The account control is outlined, while the cart uses a filled gray surface with a white icon and count badge.

### ShopBoard proposal

- Use a bold orange ShopBoard wordmark linked to the storefront.
- Make search the widest control in the main header row.
- Keep a visible search label, such as "Search products"; a placeholder supplements the label.
- Search continues to match product names, which is the existing supported behavior.
- Show account access and a cart control with the live item count. The cart control continues to reach the existing cart section.
- Keep admin access as a quieter utility link.
- Use existing categories in the navigation. Selecting a category updates the same filter state used by the sidebar.
- Use the multicolor strip as a decorative accent with no interactive or status meaning.
- Include location and additional utility controls only when their actions are implemented.
- Keep the header in normal document flow initially; sticky behavior is a separate decision.

## 5. Filter sidebar and results controls

### Sidebar

- Use a white panel, a subtle border, rounded corners, and clear section dividers.
- Show active filters at the top as compact outlined chips with a descriptive removal button.
- Use orange chip borders to echo the reference. Include the filter label and selected value when needed for clarity.
- Provide a clear-all action that resets search and category selections while keeping the current sort order.
- Use the existing category selection as the first supported filter group.
- Keep a long selected-filter list inside its own bounded scroll area when necessary; avoid nested scrolling for short lists.
- Do not show brand or delivery filters without the data and behavior required to make them work.

### Results heading

- Show breadcrumbs above the heading using the actual ShopBoard hierarchy.
- Use "All products" when no category is selected, or the selected category name otherwise.
- Display the number of matching results beside the heading. Derive it from the current filtered results rather than copying the screenshot's count.
- Position sorting on the right at desktop widths, with options for default order, price low to high, and price high to low.

### Price-range panel

The reference includes a full-width bordered panel containing rounded price options, plus icons, and arrow controls. This is a later enhancement: ShopBoard currently supports price sorting, but does not support price-range filtering. If added, ranges must use USD and actual catalog prices, selected options must have a clear active state, and arrows should appear only when the options overflow.

## 6. Product cards

### Visible reference details

- White card surfaces with thin gray borders and rounded corners.
- Generous image areas above the product details.
- Consistent alignment across the row.
- Circular favorite controls in the image's top-right corner.
- Colorful promotional badges on some images.

### ShopBoard card specification

- Retain semantic `article` elements and descriptive product image alternatives.
- Use a consistent image region with an approximately square aspect ratio on the new listing.
- Prefer `object-fit: contain` to show the complete product; review the existing photos because their backgrounds are part of the images.
- Use a neutral image background so differently shaped products align consistently.
- Under the image, show product name, category, USD price, stock status, and the existing add-to-cart button.
- Give price a stronger visual weight than category text.
- Reserve a consistent title area and align purchase actions within each row. Allow long names to wrap without overlapping price or controls.
- Use an orange action treatment with accessible contrast for add-to-cart.
- Keep out-of-stock text visible and disable its purchase button.
- Use a subtle border or shadow change on hover without moving the surrounding layout.
- Add heart buttons and promotional badges only in a later phase with working favorites and truthful promotion data. Their appearance in the reference does not imply that ShopBoard already supports them.

## 7. Visual system

These values are approximate design choices inspired by the screenshot. They are not extracted brand specifications. Confirm final contrast and appearance during implementation.

### Colors

| Token | Proposed value | Use |
| --- | --- | --- |
| `--color-brand` | `#ff6000` | Wordmark, decorative accents, selected outlines |
| `--color-action` | `#c44700` | Primary buttons with white text |
| `--color-action-hover` | `#a83b00` | Primary button hover |
| `--color-page` | `#ffffff` | Page background |
| `--color-surface` | `#ffffff` | Cards, panels, and inputs |
| `--color-surface-muted` | `#f5f5f5` | Category bar and secondary areas |
| `--color-text` | `#484848` | Main text and headings |
| `--color-muted` | `#666666` | Secondary text |
| `--color-border` | `#e5e5e5` | Decorative panel borders |
| `--color-control-border` | `#858585` | Input and interactive control boundaries |
| `--color-focus` | `#165dcc` | Keyboard focus indicator |
| `--color-success` | `#216e39` | Stock and success messaging |
| `--color-danger` | `#b42318` | Validation and destructive actions |

Use the brighter brand orange for identity and decoration. The darker action orange is a proposed accessibility adaptation for white button text. A thin decorative border does not need to serve as the only visible boundary of an interactive control.

### Typography

The reference uses a compact sans-serif appearance. The exact font cannot be identified reliably from the screenshot.

- Start with `Arial, Helvetica, sans-serif` for a similar practical appearance without introducing a font dependency.
- Body text: 16px, regular weight, approximately 1.5 line height.
- Utility and breadcrumb text: 13-14px.
- Navigation and control labels: 14-16px, medium or bold weight.
- Listing heading: 24-28px, bold.
- Product title: 15-16px, medium weight.
- Product price: 20-24px, bold.
- Wordmark: approximately 36-48px on desktop, scaled down on mobile.

### Spacing and shape

- Use a spacing scale of 4, 8, 12, 16, 24, 32, and 48px.
- Inputs and standard buttons: 8-12px corner radius.
- Cards and panels: 12px corner radius.
- Filter chips: fully rounded ends.
- Desktop product gaps: approximately 20-24px.
- Use restrained shadows for raised controls; avoid heavy shadows around every section.
- Use one consistent outline icon style. Decorative icons should not duplicate accessible text.

## 8. Responsive behavior

The screenshot only establishes a wide desktop composition. The following mobile and tablet behavior is proposed for ShopBoard.

Implement base mobile styles first and expand them with `min-width` media queries.

| Width | Proposed layout |
| --- | --- |
| Below 640px | Compact brand/account/cart row; search on its own full-width row; one product column by default; filters in an inline expandable section |
| From 640px | Two product columns; filters can remain expandable; header can use more horizontal space |
| From 1024px | Persistent left sidebar, three product columns, results heading and sorting on one row |
| From 1440px | Four product columns when card content fits, with a wider search field and full header arrangement |

- On mobile, show a visible "Filters" disclosure button using `aria-expanded` and `aria-controls`. Keep filtering in document flow instead of requiring an overlay.
- Allow category navigation to scroll inside its own row without widening the document.
- Wrap filter chips rather than clipping their text.
- Stack heading and sorting when their text no longer fits on one line.
- Keep the cart count and cart access available at every width.
- Test at 320px, 390px, 768px, 1024px, and 1440px, and at intermediate sizes. Adjust breakpoints to content rather than forcing a fixed desktop layout.
- Avoid page-level horizontal scrolling and clipped controls at 200% browser zoom.

## 9. Interaction and content states

| Situation | Required presentation |
| --- | --- |
| Search or category changes | Update cards and the matching result count using the current filtering rules |
| No matching products | Show a clear message and a working reset-filters action |
| Product added | Update the cart count and announce success through the existing status message |
| Empty cart | Show the existing helpful empty state and disable clear-cart |
| Unavailable product | Show stock text and a disabled add button |
| Storage unavailable or full | Preserve the existing readable warning and usable in-memory cart behavior |
| Product image cannot load | Proposed fallback with a neutral surface and readable "Image unavailable" text; keep product details usable |
| Keyboard focus | Show a clearly visible focus indicator on links, inputs, buttons, and disclosures |
| Validation error | Show readable feedback near the relevant form, preserving existing validation behavior |

Do not introduce a loading skeleton or a spinner for the current synchronous local catalog. If asynchronous data is introduced later, specify its loading state as part of that feature.

## 10. Cart, account, and admin pages

These areas are not visible in the reference screenshot, so their treatment is a proposed extension of the same visual system.

- Keep the existing cart section and quantity/remove/clear controls. The redesigned header provides a prominent link to that section; a cart drawer is not part of this design.
- Keep registration below the catalog and cart as a secondary section with compact, clearly labeled fields.
- Apply the same colors, typography, spacing, and form-control styles to the demo login and admin dashboard.
- Keep admin product creation, editing, stock changes, image selection, and deletion confirmation working.
- Keep danger actions visually distinct from ordinary product and cart actions.
- Preserve the existing page URLs and demo notices. The redesign does not introduce checkout, payment processing, or real authentication.

## 11. Accessibility

- Use semantic header, navigation, main, aside, section, and article elements.
- Give every input and select a visible associated label.
- Maintain logical heading levels and keyboard navigation order.
- Give icon-only buttons descriptive accessible names; hide purely decorative icons from assistive technology.
- Ensure keyboard users can reach and operate filters, sorting, cart controls, and forms.
- Use at least 4.5:1 contrast for normal text and 3:1 for large text. Verify relevant controls and focus indicators against adjacent colors.
- Use practical pointer targets of approximately 44px by 44px or larger.
- Communicate selected, stock, and error states through text or semantics as well as color.
- Keep status announcements understandable without moving focus unexpectedly.
- Respect reduced-motion preferences; avoid unnecessary animation.

## 12. Feature ownership during implementation

Follow `Agents.md` and the existing feature structure:

| Area | Owning files |
| --- | --- |
| Product cards, search/category controls, result counts, and admin product editor | `src/features/products/ui.ts` |
| Search, category filtering, sorting, and product validation | `src/features/products/logic/` |
| Catalog persistence and selection state | `src/features/products/state.ts` |
| Catalog defaults and image constants | `src/features/products/data.ts` |
| Cart rendering and controls | `src/features/cart/ui.ts` |
| Cart quantities and persistence | `src/features/cart/state.ts` |
| Cart calculations and restoration | `src/features/cart/logic/` |
| Account forms and demo status | `src/features/account/` |
| Cross-feature connections | `src/main.ts` |
| Shared page events and currency formatting | `src/shared/` |
| Static page structure | `index.html`, `admin-login.html`, `admin-dashboard.html` |
| Current shared stylesheet and design tokens | `src/styles/shop.css` |

Keep DOM access in UI files. Keep pure logic independent of the DOM and localStorage. Keep each feature's persistence in its own state file. Preserve existing storage keys, product IDs, and data formats. Use mobile-first CSS and avoid `!important`.

## 13. Implementation scope

### Proposed first pass

- Adopt the white, orange, and gray visual system.
- Build the reference-inspired header and category navigation using working ShopBoard destinations.
- Make the catalog the main storefront content.
- Reorganize existing search/category/sort controls into the new composition.
- Add active-filter presentation, a dynamic matching-result count, and filter reset controls.
- Restyle product cards, cart, forms, and admin pages consistently.
- Add the responsive filter disclosure and accessible control states.

### Later enhancements requiring separate behavior and data

- Price-range filtering and price suggestion chips.
- Brand filters and delivery-speed filtering.
- Delivery location selection.
- Favorites and promotion badges.
- Expanded marketplace utility destinations.

Do not render these later enhancements as dead controls in the first pass. Record each implemented enhancement in its owning feature and add meaningful tests for its behavior.

## 14. Acceptance checklist

- [ ] Desktop composition clearly follows the screenshot: prominent search, category bar, sidebar, and image-led product results.
- [ ] Existing ShopBoard branding, catalog data, English labels, and USD prices are retained.
- [ ] Wide screens can show four well-proportioned product columns without clipping content.
- [ ] Mobile filtering, category navigation, and cart access remain usable.
- [ ] Search, category selection, sorting, counts, chips, and reset controls stay synchronized.
- [ ] Existing cart and admin workflows still work, including storage failure messages.
- [ ] No control promises an unimplemented action or unsupported product attribute.
- [ ] The page fits its viewport at the specified test widths and at 200% zoom.
- [ ] Labels, contrast, focus, keyboard operation, and status announcements are checked.
- [ ] Mobile and desktop screenshots are reviewed against the reference and this document.
- [ ] `npm test` and `npm run build` pass after implementation.

## 15. Review before implementation

The desktop reference direction is supplied by the user. The following are proposals in this draft: adapting the design to ShopBoard branding and existing features, removing the large hero, exact tokens and sizing, mobile behavior, lower card content, and matching treatments for unseen account/admin pages.

Review these proposals before changing the application. This file records the design; creating it does not implement the redesign.


# Selection component design

This supplements the marketplace specification above.

## Shared appearance

- Apply `src/styles/selects.css` globally through `shop.css` to every HTML select.
- Use the same treatment for storefront sorting/category filters and admin image source, demo photo, category, and availability fields, including dynamically populated options.
- Closed controls have a white surface, 12px corners, the existing readable control border, and an orange hover/open border.
- Menus have a white surface, 12px corners, a light gray border, 6px inner padding, an 8px gap from the control, and a restrained shadow.
- Option rows have 8px corners, at least 44px height, and comfortable spacing. Long labels wrap; tall menus scroll within the viewport.
- Selected options use a pale orange surface, dark orange text, semibold weight, and the browser's selection checkmark.
- Hover and keyboard focus use a soft orange surface. Keyboard focus retains a visible blue outline.
- Menus fade and slide 4px over 160ms; the arrow rotates when opened. Honor reduced-motion preferences by disabling transitions.
- Disabled controls use a muted surface and text with a disabled cursor.

## Behavior and compatibility

Keep semantic labeled selects and native option elements so keyboard navigation, type-ahead, required validation, form reset, and change events stay browser-managed.

Use `appearance: base-select` and `::picker(select)` inside a feature query to customize the actual option list. Unsupported browsers retain their native option menus and receive the shared rounded closed-control styling.

No JavaScript, feature state, storage, or markup changes are needed for this visual treatment. Future selects inherit it automatically.

## Product pages and demo reviews

- Product image/title links open `/product.html?id=<id>` and keep card purchase buttons independent.
- Detail pages use the shared orange identity and multicolor header strip, a collection breadcrumb, a large rounded image area, and a clear information column.
- Show category, product name, product ID, USD price, availability, and an optional description. Preserve line breaks in descriptions.
- Use a full-width rounded Add to cart action and a header link to the storefront cart with its current quantity badge.
- Stack product information on small screens; from 768px place the image and information side by side.
- Place ratings and comments below the product in separate rounded panels. Use a warm tinted rating panel, white comment panel, and a visible browser-only demo note.
- Use five labeled, keyboard-operable radio choices for 1–5 stars, with orange selection and blue keyboard focus. One browser vote can be updated; summaries show the saved average and count.
- Show comments as text-only cards with the author, date, and message. Display an inviting empty state until the first comment is saved.
- Keep labels visible, fields at full width, touch targets at least 44px, and reduced-motion preferences respected.
- Missing/deleted products show an unavailable message and collection link with purchase/review controls hidden.
