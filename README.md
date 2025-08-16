<img src="https://raw.githubusercontent.com/adithyaharun/wallette/refs/heads/main/apps/web/public/wallette.webp" height="64" />

# Wallette

Wallette is an application to manage your own personal finance. Everything is fully offline, stored on your machine.

The inspiration came from [Maybe](https://github.com/maybe-finance/maybe) where it has been an amazing tool for managing finance for everyone. But instead of relying on a server to store everyone's data, Wallette tries to eliminate this part, and leverage web and browser technologies to make Wallette possible.

## Details

Wallette is written in React (using `react-router`) built with Vite. The application itself runs fully on client-side and requires no backend server, utilizing web technologies where possible.

Wallette is focused on making everything offline-first. The first time you open the app, everything will be ready to be used offline once fully loaded. 

The data is stored on the user's browser using IndexedDB with [Dexie.js](https://dexie.org/) to easily query data and declare database objects. This approach eliminates common issues in most full-stack applications like latency and service downtimes, ensuring users will always be able to get their data.

With these implementations, users should be able to use Wallette in most situations even when in remote locations where internet connections are extremely limited, as long as their device has enough space. [Click here](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#how_much_data_can_be_stored) to learn more about how each browser manages this limit.

## Roadmap

- ✅ Manage assets, asset categories, and transaction categories
- ✅ Manage transactions
- ✅ Manage budgets
- ✅ Export/import functionality
- ⏳ Sync to Google Drive

## Installing

No install required. Just head to [this link](https://wallette.id) and start right away!

## Development

You can run Wallette from the source code on your machine, just clone the repository and run it with your preferred JavaScript package manager. For example:

```shell
bun i     # Install dependencies
bun dev   # Serve the application.
```

## Credits

Everyone on open source community.

## License

MIT