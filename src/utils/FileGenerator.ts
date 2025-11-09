import yaml from 'yaml';

export class FileGenerator {
  static generateGemfile(structureConfig?: any) {
    // Check if the config specifies a theme and whether it's minima
    const theme = structureConfig?.theme || '';
    const isMinimaTheme = theme.toLowerCase() === 'minima';
    
    let gemfileContent = `source "https://rubygems.org"\n\ngem "jekyll", "~> 4.3"\n\ngroup :jekyll_plugins do\n  gem "jekyll-feed"\n  gem "jekyll-sitemap"\n  gem "jekyll-paginate"`;
    
    // Add minima gem if the theme is minima
    if (isMinimaTheme) {
      gemfileContent += `\n  gem "minima", "~> 2.5"`;
    }
    
    gemfileContent += `\nend`;
    
    return gemfileContent;
  }

  static generateGitignore() {
    return `# Ignore files
node_modules/
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
.bundle/
vendor/
Gemfile.lock
*.gem
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
`;
  }

  static generateReadme(structure: { title?: string; description?: string; }) {
    return "# " + (structure.title || 'Jekyll Site') + "\n\n" +
           (structure.description || 'A Jekyll site generated with Jekyll Studio AI') + "\n\n" +
           "## Getting Started\n\n" +
           "1. Install dependencies:\n" +
           "   ```bash\n" +
           "   bundle install\n" +
           "   ```\n\n" +
           "2. Serve locally:\n" +
           "   ```bash\n" +
           "   bundle exec jekyll serve --livereload\n" +
           "   ```\n\n" +
           "3. Open in browser: http://localhost:4000\n";
  }
}
