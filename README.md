<img src="https://raw.githubusercontent.com/adithyaharun/wallette/refs/heads/main/public/wallette.webp" height="64" />

# Wallette

An application for managing personal finance. Fully offline, stored on your machine.

## Roadmap

- ⏳ Manage assets, asset categories, and transaction categories
- ✅ Manage transactions
- ✅ Manage budgets
- ✅ Export/import functionality
- ⏳ Sync to Google Drive

## Installing

No install required. Just head to [this link](https://wallette.aprdth.com) and start right away!

## Development

Wallette is written in React (using `react-router`) bundled by Vite. The application itself runs fully on client-side and requires no backend server. Since the data is stored on the browser using IndexedDB, Wallette can operate without hassle as long as your device [has enough space](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria#how_much_data_can_be_stored).

You can run Wallette from the source code on your machine, just clone the repository and run:

```shell
bun i    # Install dependencies
bun dev  # Serve the application.
```

This project uses [Bun](https://bun.sh) as a package manager, but any package managers like **npm** or **pnpm** should be no issue.

## Credits

Everyone on open source community.

## License

MIT