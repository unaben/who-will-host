# Who Will Host?

A small app for planning events with friends. You put events into groups (a birthday weekend, a book club season), pick who is hosting each one, and choose who is coming. Every event has room for six attendees, no more.

You can create, edit and delete both groups and events, change each attendee's RSVP from the event card, and switch between light and dark mode with the half-moon button in the top right corner. There's still no database: everything lives in one JSON file, which keeps the project easy to poke at while we work out the shape of things.

This README is a working document. We'll keep updating it as the project grows, so if something here no longer matches the code, the README is the thing to fix.

## Getting it running

You'll need Node 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

Anything you create, change or delete is written to `data/db.json`. If you want to go back to the starting data, run `npm run db:reset`, which copies `data/db.seed.json` back over it.

## What's in the stack

- **Next.js** (App Router) with **TypeScript**
- **CSS Modules** for styling, with the `classnames` package for conditional classes (a full event card, a draft badge, a selected chip and so on)
- **CSS variables** for the colours, so light and dark mode are one set of variables swapped for another
- **Redux Toolkit** with **RTK Query** for talking to the API and caching what comes back
- **Route handlers** (`app/api/*`) as the backend, reading and writing `data/db.json`

## How the code is organised

Everything the user sees lives in `features/`. Each piece of UI gets its own folder, and the files inside follow the same pattern:

```
Thing/
  Thing.tsx             the markup
  Thing.module.css      its styles
  Thing.types.ts        its props and other types
  Thing.utils.ts        small pure helpers, if it needs any
  hooks/useThing.ts     its state and logic, if it has any
```

A component stays about what it shows, and its hook handles what it does. Not every folder has every file.

```
features/
  events/
    events.tsx                the group screen: header, event list, event form
    events.module.css         layout for that screen only
    events.types.ts           every type the app shares, used by both client and server
    events.utils.ts           validation, date formatting, seat counts, reading API errors
    hooks/useEvents.ts        data for one group, plus create / update / delete event
    components/
      EventCard/              one event, with its Edit and Delete buttons
        hooks/useEventCard.ts
      EventForm/              the form, used for both creating and editing
        EventForm.utils.ts    fills the form from an event when editing
        hooks/useEventForm.ts all of the form's state and submit logic
      EventList/              the list of cards, with its empty state
      ChipPicker/             the clickable contact chips (hosts and attendees)
  groups/
    groups.tsx                the home page: coloured group cards beside the new-group form
    groups.module.css
    group.utils.ts            picks white or dark text for a group's colour, and paints a card with it
    hooks/useGroupActions.ts  rename and delete a group
    components/
      index.ts                one place to import the group components from
      GroupHeader/            the group's title, with Edit group and Delete group
        hooks/useGroupHeader.ts
      EditGroupForm/          the rename form inside the header
      NewGroupForm/           the form on the home page
        hooks/useNewGroupForm.ts
  ConfirmDelete/              the shared "are you sure?" box for deleting an event or a group
                              (the parent passes the message, the button label and what Keep it does)
  theme/
    ThemeToggle.tsx           the half-moon button
    ThemeToggle.module.css
    theme.utils.ts            the theme type, the storage key and the start-up script
    hooks/useTheme.ts         reads the current theme and flips it
```

Around it:

```
app/                    pages, the layout and the API routes
  layout.tsx            wraps every page: sets the theme before it paints and adds the toggle
  globals.css           the light and dark colour variables
  page.tsx              home: the list of groups
  groups/[groupId]/     the screen for one group's events
  api/groups|events|lookups/
store/                  the RTK Query API slice and the Redux store
lib/                    server only: the JSON "database" and the service on top of it
data/                   db.json (live) and db.seed.json (the starting copy)
types/, constants/      small things shared across features (the view modes, the colour constants)
```

## How the data fits together

The shape comes from the JSON model we sketched at the start:

- A **user** has **contacts** (saved people) and **event groups**.
- A **group** has many **events**.
- An **event** can have several **hosts** and up to six **attendees**.
- A **host** is a saved contact who has been asked to host. The first time you pick someone as a host, a host record is created for them, and it is reused after that. The first host picked on an event is marked as the lead, the rest are co-hosts.
- An **attendee** is either a saved contact or a one-off guest you type in by name (with an optional email).

The six-attendee limit (people who haven't declined) is checked twice: the form stops you adding a seventh person, and the API refuses the request if it ever receives one. Both use the same rules from `events.utils.ts`, so they can't drift apart.

## Editing and deleting

- **Editing an event** loads it into the form beside the list, the same one used for creating events. The heading changes to "Edit event", the card you picked is highlighted, and a Cancel button takes you back to creating. Saving replaces the title, times, hosts and attendees with what's in the form, and anyone who is still on the attendee list keeps their RSVP. Picking Edit on another event while one is open swaps the form over to that one, and anything half-typed in it is dropped.
- **Deleting an event** asks "are you sure?" on the card first, then removes the event along with its hosts and attendees.
- **Editing a group** lets you change its name and description from the group's header.
- **Deleting a group** also deletes every event inside it, so the confirmation says how many events will go.
- Both confirmations use the same `ConfirmDelete` box, so deleting feels the same everywhere.
- If you change the hosts and someone is no longer hosting anything, their host record is left in place. It's harmless, and it gets reused if you pick them again.

## Light and dark mode

The half-moon button in the top right corner switches between the two. A few details worth knowing:

- The first time you visit, the app follows your system setting. Once you press the button, your choice is remembered in the browser (in `localStorage`, under `theme`) and wins from then on.
- The colours are CSS variables defined in `app/globals.css`. Dark mode is the same set of variables with different values, switched on by `data-theme="dark"` on the `<html>` element.
- A tiny script in `layout.tsx` sets that attribute before the page paints. That's what stops a flash of the wrong colours when a page loads.
- If the browser blocks storage (some private windows do), the button still works for that visit, it just won't be remembered.
- Anything painted with a group's colour (avatars, the Scheduled badge, selected chips, primary buttons) uses `var(--on-accent)` for its text. `paint(color)` in `groups/group.utils.ts` sets both `--accent` and `--on-accent` on the group screen, so white or dark text is chosen per colour and stays readable on amber, teal and lime.
- New styles should use the variables (`var(--surface)`, `var(--text)` and so on) rather than fixed colours, and then they get both themes for free.

## The API

| Method | Route                       | What it does                                                        |
| ------ | --------------------------- | ------------------------------------------------------------------- |
| GET    | `/api/groups`               | All groups, each with its event count                               |
| POST   | `/api/groups`               | Create a group (`name`, optional `description` and `color`)         |
| PUT    | `/api/groups/:groupId`      | Change a group's name, description or colour                        |
| DELETE | `/api/groups/:groupId`      | Delete a group and all its events                                   |
| GET    | `/api/lookups`              | Saved contacts and existing hosts, for the form's pickers           |
| GET    | `/api/events?groupId=grp_1` | A group's events, soonest first, with hosts and attendees filled in |
| POST   | `/api/events`               | Create an event                                                     |
| PUT    | `/api/events/:eventId`      | Replace an event's details, hosts and attendees                     |
| DELETE | `/api/events/:eventId`      | Delete an event                                                     |
| PATCH  | `/api/events/:eventId/attendees/:attendeeId` | Change one attendee's RSVP (`{ "rsvp": "accepted" }`) |

Creating and updating an event take the same body:

```json
{
  "groupId": "grp_1",
  "title": "Sunday roast",
  "startsAt": "2026-11-08T12:00:00.000Z",
  "endsAt": "2026-11-08T15:00:00.000Z",
  "status": "scheduled",
  "hostContactIds": ["con_1", "con_2"],
  "attendees": [
    { "source": "contact", "contactId": "con_3" },
    {
      "source": "guest",
      "guestName": "Chidi Eze",
      "guestEmail": "chidi@example.com"
    }
  ]
}
```

If something is wrong you get a 400 back with a `message` and an `errors` object keyed by field, which the form shows next to the right input. Asking for a group or event that doesn't exist gives a 404. An update is checked in full before anything is saved, so a rejected update never leaves an event half-changed.

## RSVPs

- Every attendee on an event card has a small dropdown: **Pending**, **Accepted**, **Maybe** or **Declined**. New attendees start as Pending.
- Changing it calls `PATCH /api/events/:eventId/attendees/:attendeeId` with just the new answer, so nothing else on the event can be touched. An unknown RSVP value gets a 400, and an attendee who isn't on that event gets a 404.
- The pill is tinted by the answer (accepted, maybe, declined), and a line under the seat count sums them up, e.g. "1 accepted · 1 maybe · 2 pending".
- **Declining frees the seat.** Only people who haven't declined count towards the six, in the card ("Full · 6/6"), the form and the API. A declined person moves to a small **Declined** line on the card instead of disappearing, so there's still a record.
- A declined person can be switched back with the same dropdown, but only while a seat is free. The card greys out the other options when the event is full, and the API refuses with a 400 if it's tried anyway.
- The edit form doesn't load declined people. Saving an edit keeps them on the event as declined, unless you add them again, which counts as a fresh invite (back to Pending).
- Editing an event keeps the RSVP of anyone who stays on the list (see Editing and deleting).
- `RSVP_VALUES` in `events.types.ts` is the one list of answers; the API check, the dropdown and the `Rsvp` type all come from it.

## Decisions worth knowing about

- **JSON file instead of a database.** It's enough for one person on one machine. Writes go through a queue and are saved with a write-then-rename, so two quick requests can't overwrite each other and a crash can't leave a half-written file. It won't hold up with real traffic, and moving to a real database later should only touch `lib/`.
- **One hard-coded user.** There's no login yet, so everything belongs to `usr_1`.
- **Hosts are picked from contacts.** That keeps one source of truth for people. If we later want hosts who aren't in your contacts, that's a small change in the service.
- **Updates replace rather than patch.** The edit form always sends the whole event, so the API treats it as the new truth. That's simpler than tracking which fields changed.
- **IDs can be reused after a delete.** New IDs are "the highest one in the file, plus one", so deleting the newest event means the next one gets its old ID. That's fine with one user and a JSON file, and goes away with a real database.
- **Dates are stored in UTC and shown in your browser's time zone.**
- **The form uses one `formData` object.** Each input has a `name` matching a key in it, and a single `handleInputChange` updates whichever one changed.
- **Logic lives in hooks, markup in components.** It keeps the `.tsx` files readable, and the hooks are the part we'll test first.

## Not built yet

- Adding and managing contacts (right now they only come from the JSON)
- Sign-in and more than one user
- Tests

Ideas from the original brief that we parked: a waitlist when an event fills up, saving a guest as a contact, shareable invite links, calendar export and clash detection, reminders, per-event notes and tasks, and recurring events or templates.

## Changelog

- **Declined frees the seat:** a declined invite no longer counts towards the six. Declined people move to a "Declined" line on the card and can come back while a seat is free. The form leaves them out, and the API keeps them on the event when you edit.
- **RSVP changes:** attendees can be set to pending, accepted, maybe or declined from the event card, saved straight away through a new `PATCH` route. Cards show a one-line RSVP summary. API errors with no message from our server now say what happened (HTTP status, unreadable reply, no connection) and are logged to the console, instead of always saying the server couldn't be reached. Also fixed the delete box on an event, which showed a literal `&apos;` in "can't".
- **Contrast fix:** avatars, the Scheduled badge, selected chips and primary buttons on the group screen no longer use fixed white text. The group screen now sets `--on-accent` (via `paint()`), so text is dark on light colours like amber and lime and white on dark ones like indigo.
- **Refactor fixes:** the group's "Keep it" button no longer crashes, the delete box on an event says "Yes, delete" instead of "Yes, delete group", the event confirmation no longer shows a stray `&apos;`, and `EventList` is now what the group screen uses to draw the list and its empty state. `ConfirmDelete` takes one `onCancel` instead of two setter functions.
- **Light and dark mode:** a half-moon button in the top right corner switches theme. It follows your system setting at first, remembers your choice after that, and applies it before the page paints so there's no flash.
- **Refactor:** every component now has its own folder with separate markup, styles, types and hook. The delete confirmation became one shared `ConfirmDelete`, and the group header, rename form and new-group form were split into their own components.
- **Home page redesign:** the page now uses 90% of the window width, with a much bigger title, intro line and form. Group cards are filled with the group's colour instead of having a coloured border, and the text on each card switches between white and dark so it stays readable on light colours like amber and lime. The new-group form sits beside the cards, like the event screen, and its button takes on whichever colour you pick. Groups with no events get a dashed "No events yet" tag. On phones the cards stack and the form drops below them.
- **Edit and delete:** events can be edited and deleted from their card, and groups can be renamed and deleted from the group header. Deleting asks for confirmation first. Edit loads the event into the same form used for creating, rather than opening a second form in the list.
- **Initial version:** groups and events can be listed and created. Hosts and attendees can be picked from saved contacts, and guests can be added by hand. Six-attendee limit enforced in the form and the API.