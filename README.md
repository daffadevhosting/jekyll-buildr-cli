# Jekyll Buildr CLI

[![NPM Version](https://img.shields.io/npm/v/jekyll-buildr-cli.svg)](https://www.npmjs.com/package/jekyll-buildr-cli)
[![License](https://img.shields.io/npm/l/jekyll-buildr-cli.svg)](https://github.com/your-username/jekyll-buildr-cli/blob/main/LICENSE)

Bring the power of AI to your Jekyll development workflow, right from your terminal. The Jekyll Buildr CLI is the official command-line interface for [Jekyll Buildr](https://jekyll-buildr.vercel.app), allowing you to generate posts, components, images, and even entire sites using AI.

## Prerequisites

-   Node.js (v16 or higher)
-   A Jekyll Buildr account. If you don't have one, you can sign up for free at [jekyll-buildr app](https://jekyll-buildr.vercel.app).

## Installation

### Global Installation

To install the CLI globally, run:

```bash
npm install -g jekyll-buildr-cli
```

This makes the `jekyll-buildr` command available system-wide.

### Development Setup

To get the CLI running locally for development, follow these steps.

1.  **Navigate to the CLI directory:**
    ```bash
    cd jekyll-buildr-cli
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the project:**
    This compiles the TypeScript source code into JavaScript.
    ```bash
    npm run build
    ```

4.  **Make the command available:**
    You have two options to run the CLI locally:

    **Option A: Global Install from Local Source (Recommended)**
    This simulates a global installation and makes the `jekyll-buildr` command available system-wide.
    ```bash
    # Run this from within the jekyll-buildr-cli directory
    npm install -g .
    ```
    *Note: Depending on your system configuration, you might need to run this command with `sudo`.*

    **Option B: Using `npx`**
    If you prefer not to install it globally, you can run the command using `npx` from within the `jekyll-buildr-cli` directory.
    ```bash
    # Example:
    npx jekyll-buildr login
    ```

## Getting Started: Login

Before you can use the AI-powered features, you must log in to your Jekyll Buildr account.

```bash
jekyll-buildr login
```
This command will open your web browser for you to securely log in. Your credentials will be stored locally for future sessions.

---

## Commands

Here is a complete list of available commands with detailed explanations.

### `login`

Authenticates the CLI with your Jekyll Buildr account.

```bash
jekyll-buildr login
```

**Description:** Opens your web browser to securely log in to your Jekyll Buildr account. After successful authentication, your credentials are stored locally for future CLI sessions.

### `logout`

Logs you out of the CLI by deleting your local session credentials.

```bash
jekyll-buildr logout
```

**Description:** Removes your stored authentication credentials from your local machine, requiring you to log in again for future sessions.

### `create <siteName> <prompt>`

Creates a new, complete Jekyll project structure using an AI-powered prompt.

-   `<siteName>`: The name of the directory for your new project.
-   `<prompt>`: A descriptive prompt of the site you want to build.

**Options:**
-   `--no-docker`: Use local Jekyll installation instead of Docker

**Example:**
```bash
jekyll-buildr create my-awesome-blog "A personal blog about my travel adventures and photography with a clean, minimalist design"
```

**What it creates:** This command generates a complete Jekyll site with:
-   Gemfile with required dependencies
-   Configuration file (_config.yml) 
-   Layout files (_layouts/)
-   Include components (_includes/)
-   Sample pages and posts
-   Asset directories (CSS, JS, images)
-   README.md with setup instructions

### `add post <title>`

Generates a new blog post in the `_posts` directory using AI.

-   `<title>`: The title of the blog post.

**Options:**
-   `--tags <tags>`: Comma-separated list of tags for the post
-   `--categories <categories>`: Comma-separated list of categories for the post

**Example:**
```bash
jekyll-buildr add post "The Rise of AI in Web Development" --tags "ai,machine-learning,webdev" --categories "technology,trends"
```

**What it does:** Creates a new markdown file in the `_posts` directory with the current date, title slug, and AI-generated content with proper Jekyll frontmatter.

### `serve`

Runs the standard `jekyll serve` command within your current project directory.

**Options:**
-   `-p, --port <port>`: Port to use for the development server (default: 4000)
-   `--no-docker`: Use local Jekyll installation instead of Docker

**Example:**
```bash
jekyll-buildr serve --port 3000
```

**What it does:** Starts a local Jekyll development server with live reload, making your site accessible at http://localhost:4000 (or specified port) for preview.

### `build`

Builds the static site for deployment.

**Options:**
-   `--no-docker`: Use local Jekyll installation instead of Docker

**Example:**
```bash
jekyll-buildr build
```

**What it does:** Compiles your Jekyll site into static files in the `_site` directory, ready for deployment to a web server or hosting service.

### `doctor`

Checks your system environment and dependencies.

```bash
jekyll-buildr doctor
```

**What it does:** Verifies that Node.js, Docker, Jekyll, and API connectivity are properly configured, and provides helpful suggestions if issues are detected.

---

## Performance Features

### Caching
The CLI now includes intelligent caching that stores API responses to reduce repeated calls and improve performance. API calls with the same parameters will be served from the cache, making subsequent executions faster.

### Memory Management
Automatic memory management and garbage collection help ensure efficient memory usage during operations, especially when processing large sites.

### Parallel Processing
File operations are now performed in parallel where possible, significantly reducing the time needed to create complex site structures.

---

## Troubleshooting

### Common Issues

1. **Permission Errors**: If you encounter permission errors during installation, try:
   ```bash
   npm install -g jekyll-buildr-cli --unsafe-perm=true
   ```

2. **Docker Not Found**: If Docker is not found but you have it installed, ensure it's in your PATH or use the `--no-docker` option.

3. **API Connection Issues**: Check your internet connection and ensure you're logged in. You can use `jekyll-buildr doctor` to check API connectivity.

4. **Memory Issues**: For large sites, ensure you have sufficient RAM. The CLI will attempt to manage memory automatically, but very large sites may require more resources.

### Getting Help

For additional support, run:
```bash
jekyll-buildr --help
```

This will display detailed help information for all commands.

---

## Contributing

Contributions are welcome! Please see the [contributing guidelines](CONTRIBUTING.md) for more information.

---

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.