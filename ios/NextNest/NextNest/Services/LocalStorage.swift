import Foundation

/// Lightweight persistence for checklist and neighborhood comparison.
enum LocalStorage {
    private static let defaults = UserDefaults.standard

    private enum Keys {
        static let checklist = "nextnest.savedChecklist"
        static let checklistCompleted = "nextnest.checklistCompleted"
        static let neighborhood = "nextnest.savedNeighborhood"
    }

    // MARK: - Checklist

    static func saveChecklist(_ items: [ChecklistItem]) {
        guard let data = try? JSONEncoder().encode(items) else { return }
        defaults.set(data, forKey: Keys.checklist)
    }

    static func loadChecklist() -> [ChecklistItem]? {
        guard let data = defaults.data(forKey: Keys.checklist),
              let items = try? JSONDecoder().decode([ChecklistItem].self, from: data) else {
            return nil
        }
        return items
    }

    static func saveChecklistCompleted(_ ids: Set<String>) {
        defaults.set(Array(ids), forKey: Keys.checklistCompleted)
    }

    static func loadChecklistCompleted() -> Set<String> {
        guard let arr = defaults.stringArray(forKey: Keys.checklistCompleted) else {
            return []
        }
        return Set(arr)
    }

    static func clearChecklist() {
        defaults.removeObject(forKey: Keys.checklist)
        defaults.removeObject(forKey: Keys.checklistCompleted)
    }

    // MARK: - Neighborhood

    static func saveNeighborhood(_ data: NeighborhoodData) {
        guard let encoded = try? JSONEncoder().encode(data) else { return }
        defaults.set(encoded, forKey: Keys.neighborhood)
    }

    static func loadNeighborhood() -> NeighborhoodData? {
        guard let data = defaults.data(forKey: Keys.neighborhood),
              let decoded = try? JSONDecoder().decode(NeighborhoodData.self, from: data) else {
            return nil
        }
        return decoded
    }

    static func clearNeighborhood() {
        defaults.removeObject(forKey: Keys.neighborhood)
    }
}
