# Changelog

## [2.0.2] - 2025-11-09

### Added
- **Performance Monitoring**: New PerformanceMonitor utility for tracking execution times and memory usage
- **Memory Management**: MemoryManager class with automatic garbage collection and memory usage tracking
- **Caching System**: CacheService for API response caching with TTL and size management
- **Error Handling**: Comprehensive ErrorHandler with error logging and user-friendly messages
- **Lazy Loading**: Dynamic imports for command modules to improve startup time

### Changed
- **API Calls**: All API requests now use caching to reduce response times and server load
- **File Operations**: Parallel file writing using Promise.all() for faster disk I/O
- **Error Handling**: Enhanced error reporting with contextual information and troubleshooting suggestions
- **Startup Time**: Significantly reduced by implementing lazy loading for command modules
- **Memory Usage**: Improved with automatic garbage collection and better cleanup routines

### Fixed
- **Memory Leaks**: Resolved potential memory leaks by adding proper cleanup routines
- **Spinner Management**: Fixed spinner hanging issues in command execution
- **Exception Handling**: Added handlers for uncaught exceptions and rejections
- **File Operations**: Improved error handling during file system operations

---

## [2.0.1] - 2024-01-01

### Added
- **Command Documentation**: Detailed command explanations in README
- **Performance Metrics**: Added loading indicators and performance feedback
- **Better Error Messages**: More descriptive error messages with suggestions

### Changed
- **API Integration**: Improved integration with Jekyll Buildr API
- **User Interface**: Enhanced CLI user experience with better messaging

---

## [2.0.0] - 2023-12-01

### Added
- **Complete CLI Tool**: Full-featured CLI for Jekyll site management with AI integration
- **Authentication System**: Login/logout functionality with token management
- **Create Command**: Generate new Jekyll sites from AI prompts
- **Add Post Command**: Create new blog posts with AI assistance
- **Serve Command**: Run local Jekyll development server
- **Build Command**: Build static sites for deployment
- **Doctor Command**: System environment checks and troubleshooting

---

## [1.0.0] - 2023-10-01

### Added
- **Initial Release**: Basic CLI skeleton and project structure