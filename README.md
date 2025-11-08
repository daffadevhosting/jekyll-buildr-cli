# Jekyll Buildr CLI

[![NPM Version](https://img.shields.io/npm/v/jekyll-buildr-cli.svg)](https://www.npmjs.com/package/jekyll-buildr-cli)
[![License](https://img.shields.io/npm/l/jekyll-buildr-cli.svg)](https://github.com/your-username/jekyll-buildr-cli/blob/main/LICENSE)

Bring the power of AI to your Jekyll development workflow, right from your terminal. The Jekyll Buildr CLI is the official command-line interface for [Jekyll Buildr](https://jekyll-buildr.vercel.app), allowing you to generate posts, components, images, and even entire sites using AI.

## Prerequisites

-   Node.js (v16 or higher)
-   A Jekyll Buildr account. If you don't have one, you can sign up for free at [jekyll-buildr app](https://jekyll-buildr.vercel.app).

## Development Setup

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

Here is a complete list of available commands.

### `login`

Authenticates the CLI with your Jekyll Buildr account.

```bash
jekyll-buildr login
```

### `logout`

Logs you out of the CLI by deleting your local session credentials.

```bash
jekyll-buildr logout
```

### `create <projectName> [prompt]`

Creates a new, basic Jekyll project structure using an AI-powered prompt.

-   `<projectName>`: The name of the directory for your new project.
-   `[prompt]`: A descriptive prompt of the site you want to build.

**Example:**
```bash
jekyll-buildr create my-awesome-blog "A personal blog about my travel adventures and photography"
```

### `build`

Runs the standard `jekyll build` command within your current project directory. Requires Jekyll to be installed in the project's bundle.

```bash
jekyll-buildr build
```

### `generate-post`

Generates a new blog post in the `_posts` directory using AI. Must be run from within a Jekyll project folder.

**Options:**
-   `-t, --title <title>`: (Required) The title of the blog post.
-   `-a, --author <author>`: The author's name.
-   `-c, --categories <categories>`: Comma-separated list of categories.

**Example:**
```bash
jekyll-buildr generate-post --title "The Rise of AI in Web Development" --categories "tech,ai,webdev"
```

### `generate-component <prompt>`

Generates a reusable Jekyll component (in the `_includes` directory) based on a descriptive prompt.

-   `<prompt>`: A description of the component you want.

**Example:**
```bash
jekyll-buildr generate-component "a responsive navigation bar with a logo and three links"
```

### `generate-image <prompt>`

Generates an image using AI and saves it to the `assets/images` directory. **This is a Pro-only feature.**

-   `<prompt>`: A description of the image you want to create.

**Example:**
```bash
jekyll-buildr generate-image "a futuristic cat wearing sunglasses, cyberpunk style"
```
