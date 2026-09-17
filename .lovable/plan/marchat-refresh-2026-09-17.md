# MarChat refresh

## What I’ll build
- Replace the placeholder chat page with a polished, full-height MarChat workspace that matches MarDev.
- Add room navigation, recent message history, live incoming messages, clear empty/loading/error states, and a compact composer.
- Keep the global MarDev account visible and consistent across home, chat, onboarding, and settings.
- Make the home-page MarChat links open the built-in chat instead of sending people elsewhere.

## Supabase improvements
- Use the existing rooms, memberships, and messages tables with secure account-bound access rules.
- Subscribe to new messages only while a room is open and cleanly disconnect when leaving it.
- Load message history in limited batches, prevent blank or oversized messages, and show useful send/retry feedback.
- Keep sessions persistent through Supabase’s secure browser session storage rather than treating profile cookies as authentication.

## Visual direction
- Use a focused developer-workspace feel: near-black canvas, crisp neutral surfaces, warm coral status accents, and restrained cyan highlights.
- Use a three-part desktop layout and a compact mobile room drawer, with no decorative blobs or generic AI styling.
- Keep messages readable: assistant/system text directly on the surface and high-contrast filled bubbles for the signed-in user.

## Technical details
- Compose the transcript and composer from the installed AI Elements primitives.
- Add a dedicated chat page and small data hook; reuse the existing Supabase client and account context.
- Fix the current onboarding type error and update global metadata for MarDev/MarChat.
- Validate the signed-in experience at desktop and mobile sizes, plus build and runtime diagnostics.
