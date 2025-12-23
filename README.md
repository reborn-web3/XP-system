# 🎯 Project Vision
An Obsidian plugin that automatically tracks task completion and rewards you with experience points (XP), creating a gamified productivity system that motivates consistent progress.

# 📚 MVP Features
- Automatic XP rewards when tasks move to "Done" columns
- Smart difficulty-based rewards (Easy/Medium/Hard)
- Prevent duplicate XP with built-in tracking
- Persistent player statistics across sessions
- Real-time XP display in status bar
- Leveling system with configurable thresholds

### Development Phases

##### Phase 0: Foundation Setup
Goal: Establish development environment and testing infrastructure

Setup Node.js development environment
Initialize plugin structure using Obsidian API
Create testing workspace in 00. Inbox/test.md
Configure hot reload for rapid development
Verify "Hello World" plugin loads successfully

Output: Working development environment with test files

##### Phase 1: Kanban Parser
Goal: Read and understand Kanban board structure

Build markdown parser for Kanban format
Extract task metadata (xp, xp-applied, parent links)
Identify task sections (Easy/Medium/Hard columns)
Parse completion status from checkboxes

Output: Plugin reads and structures Kanban data

##### Phase 2: Change Detection
Goal: Monitor task movements and completions

Subscribe to file modification events
Compare previous and current file states
Detect when tasks move to "Done" columns
Implement debounce to prevent spam detection
Add debug logging for development

Output: Plugin detects completed tasks in real-time

##### Phase 3: XP Calculation Engine
Goal: Award correct XP amounts without duplicates

Define default XP rewards per difficulty
Calculate XP from inline metadata or defaults
Validate xp-applied flag before awarding
Update task metadata after XP applied
Write changes back to markdown file

Output: Accurate, duplicate-free XP rewards

##### Phase 4: Data Persistence
Goal: Save player progress between sessions

Design PlayerStats data model (XP, level, history)
Implement JSON storage in plugin folder
Load stats on plugin initialization
Auto-save after each XP transaction
Calculate level progression (XP thresholds)

Output: Persistent player statistics

##### Phase 5: User Interface
Goal: Display progress and provide feedback

Status bar widget showing level and XP
Command palette integration for stats view
Toast notifications on XP rewards
Dataview integration for dashboard display

Output: Visible player progress throughout Obsidian

##### Phase 6: Configuration & Polish
Goal: Make plugin customizable and production-ready

Settings page for quest file path
Configurable XP rewards per difficulty
Adjustable level-up thresholds
Toggle for notifications
Error handling and user feedback
Complete documentation

Output: Production-ready, configurable plugin
