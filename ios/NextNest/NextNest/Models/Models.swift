import Foundation

// MARK: - API Response Wrappers

struct APIResponse<T: Decodable>: Decodable {
    let data: T?
    let error: String?
    let status: Int?
}

struct SimpleResponse: Decodable {
    let success: Bool?
    let error: String?
}

// MARK: - Auth

struct AuthUser: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
}

struct RegisterRequest: Encodable {
    let name: String
    let email: String
    let password: String
}

// MARK: - Intake

enum MoveType: String, Codable, CaseIterable {
    case buy, rent
    var displayName: String {
        switch self {
        case .buy: return "Buy"
        case .rent: return "Rent"
        }
    }
}

enum TimelineFlexibility: String, Codable, CaseIterable {
    case flexible, somewhat, fixed
    var displayName: String {
        switch self {
        case .flexible: return "Flexible"
        case .somewhat: return "Somewhat flexible"
        case .fixed: return "Fixed date"
        }
    }
}

struct IntakeRequest: Encodable {
    let movingFrom: String
    let movingTo: String
    let targetMoveDate: String
    let moveType: String
    let needsToSell: Bool
    let hasPreApproval: Bool
    let employmentSecured: Bool
    let timelineFlexibility: String
    let peopleCount: Int
    let topConcern: String
}

struct IntakeResponse: Codable, Identifiable {
    let id: String
    let userId: String
    let movingFrom: String
    let movingTo: String
    let targetMoveDate: String
    let moveType: MoveType
    let needsToSell: Bool
    let hasPreApproval: Bool
    let employmentSecured: Bool
    let timelineFlexibility: TimelineFlexibility
    let peopleCount: Int
    let topConcern: String?
    let createdAt: String
}

struct IntakeResult: Decodable {
    let intakeId: String
    let planId: String
}

// MARK: - Plan

struct RelocationPlan: Codable, Identifiable {
    let id: String
    let userId: String
    let targetDate: String
    let readinessScore: Int
    let planConfig: PlanConfig?
    let createdAt: String
    let updatedAt: String
}

struct PlanConfig: Codable {
    let intakeId: String?
}

struct PlanGenerateRequest: Encodable {
    let planId: String
}

struct PlanGenerateResult: Decodable {
    let planId: String
    let readinessScore: Int
}

// MARK: - Milestones

enum MilestoneCategory: String, Codable, CaseIterable {
    case housing, finance, logistics, admin

    var displayName: String {
        switch self {
        case .housing: return "Housing"
        case .finance: return "Finance"
        case .logistics: return "Logistics"
        case .admin: return "Admin"
        }
    }

    var iconName: String {
        switch self {
        case .housing: return "house.fill"
        case .finance: return "dollarsign.circle.fill"
        case .logistics: return "shippingbox.fill"
        case .admin: return "doc.text.fill"
        }
    }
}

struct Milestone: Codable, Identifiable {
    let id: String
    let planId: String
    let userId: String
    let title: String
    let description: String?
    let targetDate: String
    let sortOrder: Int
    let category: MilestoneCategory
    var isCompleted: Bool
    let completedAt: String?
    let createdAt: String
}

struct MilestoneUpdateRequest: Encodable {
    let isCompleted: Bool
}

struct MilestoneUpdateResult: Decodable {
    let milestone: Milestone
    let readinessScore: Int
}

// MARK: - Budget

struct BudgetItem: Codable, Identifiable {
    let id: String
    let planId: String
    let userId: String
    let category: String
    let label: String
    let estimatedLow: Int
    let estimatedHigh: Int
    let notes: String?
    let createdAt: String

    var formattedRange: String {
        let low = Double(estimatedLow) / 100.0
        let high = Double(estimatedHigh) / 100.0
        return "\(formatDollars(low)) – \(formatDollars(high))"
    }

    var midEstimate: Double {
        Double(estimatedLow + estimatedHigh) / 200.0
    }

    private func formatDollars(_ value: Double) -> String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.maximumFractionDigits = 0
        return f.string(from: NSNumber(value: value)) ?? "$\(Int(value))"
    }
}

struct UserBudget: Codable, Identifiable {
    let id: String
    let userId: String
    let totalBudget: Int
    let housingBudget: Int?
    let movingBudget: Int?
    let travelBudget: Int?
    let emergencyFund: Int?
    let notes: String?
    let createdAt: String
    let updatedAt: String

    var totalDollars: Double { Double(totalBudget) / 100.0 }
}

struct UserBudgetRequest: Encodable {
    let totalBudget: Int
    let housingBudget: Int?
    let movingBudget: Int?
    let travelBudget: Int?
    let emergencyFund: Int?
    let notes: String?
}

// MARK: - Expenses

struct Expense: Codable, Identifiable {
    let id: String
    let userId: String
    let plaidTransactionId: String?
    let name: String
    let amount: Int
    let category: String
    let date: String
    let isMoveRelated: Bool?
    let notes: String?
    let createdAt: String

    var amountDollars: Double { Double(amount) / 100.0 }

    var formattedAmount: String {
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.maximumFractionDigits = 2
        return f.string(from: NSNumber(value: amountDollars)) ?? "$\(amountDollars)"
    }
}

struct ExpenseRequest: Encodable {
    let name: String
    let amount: Int
    let category: String
    let date: String
    let notes: String?
}

// MARK: - Moving Quotes

enum QuoteStatus: String, Codable {
    case pending, calling, connected, completed, failed

    var displayName: String {
        switch self {
        case .pending: return "Pending"
        case .calling: return "Calling..."
        case .connected: return "Connected"
        case .completed: return "Completed"
        case .failed: return "Failed"
        }
    }

    var iconName: String {
        switch self {
        case .pending: return "clock.fill"
        case .calling: return "phone.arrow.up.right.fill"
        case .connected: return "phone.fill"
        case .completed: return "checkmark.circle.fill"
        case .failed: return "xmark.circle.fill"
        }
    }
}

struct MovingQuote: Codable, Identifiable {
    let id: String
    let planId: String
    let userId: String
    let companyName: String
    let phoneNumber: String
    let callId: String?
    let status: QuoteStatus
    let transcript: String?
    let quoteLow: Int?
    let quoteHigh: Int?
    let notes: String?
    let createdAt: String
    let updatedAt: String

    var formattedQuote: String? {
        guard let low = quoteLow, let high = quoteHigh else { return nil }
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.maximumFractionDigits = 0
        let l = f.string(from: NSNumber(value: Double(low) / 100.0)) ?? ""
        let h = f.string(from: NSNumber(value: Double(high) / 100.0)) ?? ""
        return "\(l) – \(h)"
    }
}

struct OutboundCallRequest: Encodable {
    let companyName: String
    let phoneNumber: String
}

struct OutboundCallResult: Decodable {
    let quoteId: String
    let callId: String
    let status: String
}

// MARK: - Lease Documents

struct LeaseDocument: Codable, Identifiable {
    let id: String
    let userId: String
    let fileName: String
    let fileType: String
    let fileSize: Int?
    let extractedData: LeaseExtractedData?
    let status: String
    let createdAt: String
}

struct LeaseExtractedData: Codable {
    let leaseEndDate: String?
    let monthlyRent: Double?
    let securityDeposit: Double?
    let noticeRequired: String?
    let moveOutChecklist: [String]?
    let cleaningRequirements: [String]?
    let penalties: [String]?
    let landlordContact: String?
    let petDeposit: Double?
    let utilities: [String]?
    let keyReturnInstructions: String?
    let importantDates: [ImportantDate]?
    let summary: String?
}

struct ImportantDate: Codable {
    let date: String?
    let description: String?
}

struct LeaseUploadRequest: Encodable {
    let text: String
    let fileName: String
    let fileType: String
    let fileSize: Int
}

struct LeaseUploadResult: Decodable {
    let id: String
    let extractedData: LeaseExtractedData?
}

// MARK: - Move-out Photos

struct MovePhoto: Codable, Identifiable {
    let id: String
    let room: String
    let caption: String?
    let createdAt: String
}

struct PhotoUploadRequest: Encodable {
    let room: String
    let caption: String?
    let imageData: String
}

struct PhotoUploadResult: Decodable {
    let id: String
}

// MARK: - Mover Recommendations

struct MoverRecommendation: Codable, Identifiable {
    var id: String { name }
    let name: String
    let type: String
    let priceRange: String
    let bestFor: String
    let website: String
    let phone: String
    let rating: Double
    let pros: [String]
    let cons: [String]
}

// MARK: - AI Checklist

struct ChecklistItem: Codable, Identifiable {
    var id: String { task }
    let task: String
    let timeframe: String
    let priority: String
    let tip: String
}

// MARK: - Neighborhood Comparison

struct NeighborhoodData: Codable {
    let origin: LocationProfile
    let destination: LocationProfile
    let keyDifferences: [String]
    let tips: [String]
}

struct LocationProfile: Codable {
    let name: String
    let costOfLiving: String
    let climate: String
    let transitScore: String
    let highlights: [String]
}

// MARK: - AI Chat

struct ChatMessage: Codable, Identifiable {
    let id: String
    let role: String
    let content: String

    init(id: String = UUID().uuidString, role: String, content: String) {
        self.id = id
        self.role = role
        self.content = content
    }
}

/// UIMessage format expected by Vercel AI SDK convertToModelMessages.
struct ChatRequest: Encodable {
    let messages: [UIMessagePayload]
}

struct UIMessagePayload: Encodable {
    let role: String
    let parts: [UIMessagePartPayload]
}

struct UIMessagePartPayload: Encodable {
    let type: String
    let text: String

    init(text: String) {
        self.type = "text"
        self.text = text
    }
}

// MARK: - Dashboard

struct DashboardData: Decodable {
    var plan: RelocationPlan
    var milestones: [Milestone]
    let budgetItems: [BudgetItem]
    let intake: IntakeResponse
    let daysUntilMove: Int
}
