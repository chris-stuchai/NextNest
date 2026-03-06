import Foundation

/// Centralized networking layer for all NextNest API calls.
actor APIClient {
    static let shared = APIClient()

    private let baseURL = "https://nextnest-web-production.up.railway.app"
    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.httpCookieAcceptPolicy = .always
        config.httpShouldSetCookies = true
        config.httpCookieStorage = .shared
        config.timeoutIntervalForRequest = 60
        self.session = URLSession(configuration: config)
        self.decoder = JSONDecoder()
    }

    // MARK: - Auth

    func register(name: String, email: String, password: String) async throws -> AuthUser {
        let body = RegisterRequest(name: name, email: email, password: password)
        let response: APIResponse<AuthUser> = try await post("/api/auth/register", body: body)
        guard let user = response.data else {
            throw APIError.server(response.error ?? "Registration failed")
        }
        return user
    }

    func signIn(email: String, password: String) async throws {
        let csrfURL = URL(string: "\(baseURL)/api/auth/csrf")!
        let (csrfData, _) = try await session.data(from: csrfURL)
        let csrf = try decoder.decode([String: String].self, from: csrfData)
        guard let token = csrf["csrfToken"] else {
            throw APIError.server("Failed to get CSRF token")
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/api/auth/callback/credentials")!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        let formBody = "email=\(email.urlEncoded)&password=\(password.urlEncoded)&csrfToken=\(token.urlEncoded)&json=true"
        request.httpBody = formBody.data(using: .utf8)

        let (data, httpResponse) = try await session.data(for: request)
        if let resp = httpResponse as? HTTPURLResponse, resp.statusCode >= 400 {
            let body = String(data: data, encoding: .utf8) ?? ""
            if body.contains("CredentialsSignin") { throw APIError.unauthorized }
            throw APIError.server("Sign in failed (\(resp.statusCode))")
        }
    }

    func signOut() async throws {
        let csrfURL = URL(string: "\(baseURL)/api/auth/csrf")!
        let (csrfData, _) = try await session.data(from: csrfURL)
        let csrf = try decoder.decode([String: String].self, from: csrfData)

        var request = URLRequest(url: URL(string: "\(baseURL)/api/auth/signout")!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        request.httpBody = "csrfToken=\(csrf["csrfToken"]?.urlEncoded ?? "")".data(using: .utf8)
        _ = try await session.data(for: request)
        HTTPCookieStorage.shared.cookies?.forEach { HTTPCookieStorage.shared.deleteCookie($0) }
    }

    func fetchSession() async throws -> AuthUser? {
        let url = URL(string: "\(baseURL)/api/auth/session")!
        let (data, _) = try await session.data(from: url)
        let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        guard let user = json?["user"] as? [String: Any],
              let id = user["id"] as? String,
              let email = user["email"] as? String else { return nil }
        return AuthUser(id: id, email: email, name: user["name"] as? String)
    }

    // MARK: - Dashboard

    func fetchDashboard() async throws -> DashboardData {
        let response: APIResponse<DashboardData> = try await get("/api/dashboard")
        guard let data = response.data else {
            throw APIError.server(response.error ?? "No dashboard data")
        }
        return data
    }

    // MARK: - Intake

    func submitIntake(_ intake: IntakeRequest) async throws -> IntakeResult {
        let response: APIResponse<IntakeResult> = try await post("/api/intake", body: intake)
        guard let result = response.data else {
            throw APIError.server(response.error ?? "Intake submission failed")
        }
        return result
    }

    // MARK: - Plan Generation

    func generatePlan(planId: String) async throws -> PlanGenerateResult {
        let response: APIResponse<PlanGenerateResult> = try await post("/api/plan/generate", body: PlanGenerateRequest(planId: planId))
        guard let result = response.data else {
            throw APIError.server(response.error ?? "Plan generation failed")
        }
        return result
    }

    // MARK: - Milestones

    func toggleMilestone(id: String, isCompleted: Bool) async throws -> MilestoneUpdateResult {
        let response: APIResponse<MilestoneUpdateResult> = try await patch("/api/milestones/\(id)", body: MilestoneUpdateRequest(isCompleted: isCompleted))
        guard let result = response.data else {
            throw APIError.server(response.error ?? "Milestone update failed")
        }
        return result
    }

    // MARK: - Budget

    func fetchBudget() async throws -> UserBudget? {
        struct BudgetResponse: Decodable { let data: UserBudget? }
        let response: BudgetResponse = try await get("/api/budget")
        return response.data
    }

    func saveBudget(_ budget: UserBudgetRequest) async throws -> UserBudget {
        struct BudgetResponse: Decodable { let data: UserBudget }
        let response: BudgetResponse = try await post("/api/budget", body: budget)
        return response.data
    }

    // MARK: - Expenses

    func fetchExpenses() async throws -> [Expense] {
        struct ExpenseResponse: Decodable { let data: [Expense] }
        let response: ExpenseResponse = try await get("/api/expenses")
        return response.data
    }

    func addExpense(_ expense: ExpenseRequest) async throws -> Expense {
        struct ExpenseResponse: Decodable { let data: Expense }
        let response: ExpenseResponse = try await post("/api/expenses", body: expense)
        return response.data
    }

    func deleteExpense(id: String) async throws {
        let _: SimpleResponse = try await delete("/api/expenses?id=\(id)")
    }

    // MARK: - Moving Quotes

    func fetchQuotes() async throws -> [MovingQuote] {
        struct QuotesResponse: Decodable { let data: [MovingQuote] }
        let response: QuotesResponse = try await get("/api/quotes")
        return response.data
    }

    func requestOutboundCall(companyName: String, phoneNumber: String) async throws -> OutboundCallResult {
        let body = OutboundCallRequest(companyName: companyName, phoneNumber: phoneNumber)
        return try await post("/api/retell/outbound-call", body: body)
    }

    // MARK: - Lease

    func fetchLeaseDocuments() async throws -> [LeaseDocument] {
        struct LeaseResponse: Decodable { let data: [LeaseDocument] }
        let response: LeaseResponse = try await get("/api/lease")
        return response.data
    }

    func uploadLease(_ req: LeaseUploadRequest) async throws -> LeaseUploadResult {
        struct LeaseResponse: Decodable { let data: LeaseUploadResult }
        let response: LeaseResponse = try await post("/api/lease", body: req)
        return response.data
    }

    // MARK: - Photos

    func fetchPhotos() async throws -> [MovePhoto] {
        struct PhotosResponse: Decodable { let data: [MovePhoto] }
        let response: PhotosResponse = try await get("/api/photos")
        return response.data
    }

    func uploadPhoto(_ req: PhotoUploadRequest) async throws -> PhotoUploadResult {
        struct PhotoResponse: Decodable { let data: PhotoUploadResult }
        let response: PhotoResponse = try await post("/api/photos", body: req)
        return response.data
    }

    func deletePhoto(id: String) async throws {
        let _: SimpleResponse = try await delete("/api/photos?id=\(id)")
    }

    // MARK: - Movers

    func fetchMoverRecommendations() async throws -> [MoverRecommendation] {
        let response: APIResponse<[MoverRecommendation]> = try await post("/api/movers", body: EmptyBody())
        guard let data = response.data else {
            throw APIError.server(response.error ?? "Failed to get recommendations")
        }
        return data
    }

    // MARK: - AI Checklist

    func generateChecklist() async throws -> [ChecklistItem] {
        let response: APIResponse<[ChecklistItem]> = try await post("/api/ai/checklist", body: EmptyBody())
        guard let data = response.data else {
            throw APIError.server(response.error ?? "Checklist generation failed")
        }
        return data
    }

    // MARK: - Neighborhood Comparison

    func fetchNeighborhoodComparison() async throws -> NeighborhoodData {
        let response: APIResponse<NeighborhoodData> = try await post("/api/ai/neighborhood", body: EmptyBody())
        guard let data = response.data else {
            throw APIError.server(response.error ?? "Comparison failed")
        }
        return data
    }

    // MARK: - AI Chat (streaming)

    /// Streams text chunks from the Vercel AI SDK streaming protocol.
    func sendChatMessage(messages: [ChatMessage]) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            Task {
                let url = URL(string: "\(baseURL)/api/ai/chat")!
                var request = URLRequest(url: url)
                request.httpMethod = "POST"
                request.setValue("application/json", forHTTPHeaderField: "Content-Type")
                let payload = ChatRequest(messages: messages.map { msg in
                    UIMessagePayload(
                        role: msg.role,
                        parts: [UIMessagePartPayload(text: msg.content)]
                    )
                })
                request.httpBody = try? JSONEncoder().encode(payload)

                do {
                    let (bytes, response) = try await self.session.bytes(for: request)
                    if let http = response as? HTTPURLResponse, http.statusCode != 200 {
                        continuation.finish(throwing: APIError.server("Chat failed (\(http.statusCode))"))
                        return
                    }
                    for try await line in bytes.lines {
                        let parsed = self.parseSSELine(line)
                        if !parsed.isEmpty {
                            continuation.yield(parsed)
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    }

    /// Parses SSE line from Vercel AI SDK toUIMessageStreamResponse().
    /// Format: data: {"type":"text-delta","delta":"chunk"} or data: [DONE]
    private func parseSSELine(_ line: String) -> String {
        guard line.hasPrefix("data: ") else { return "" }
        let payload = String(line.dropFirst(6)).trimmingCharacters(in: .whitespaces)
        if payload == "[DONE]" { return "" }
        guard let data = payload.data(using: .utf8),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = obj["type"] as? String else { return "" }
        if type == "text-delta", let delta = obj["delta"] as? String, !delta.isEmpty {
            return delta
        }
        if type == "error" { return "" }
        return ""
    }

    // MARK: - Profile

    func updateProfile(name: String) async throws {
        struct NameBody: Encodable { let name: String }
        let _: SimpleResponse = try await patch("/api/user/profile", body: NameBody(name: name))
    }

    func changePassword(currentPassword: String?, newPassword: String) async throws {
        struct PasswordBody: Encodable { let currentPassword: String?; let newPassword: String }
        let _: SimpleResponse = try await patch("/api/user/password", body: PasswordBody(currentPassword: currentPassword, newPassword: newPassword))
    }

    func deleteAccount() async throws {
        let _: SimpleResponse = try await delete("/api/account")
    }

    // MARK: - Generic Helpers

    private func get<T: Decodable>(_ path: String) async throws -> T {
        var request = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        return try await perform(request)
    }

    private func post<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try JSONEncoder().encode(body)
        return try await perform(request)
    }

    private func patch<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.httpBody = try JSONEncoder().encode(body)
        return try await perform(request)
    }

    private func delete<T: Decodable>(_ path: String) async throws -> T {
        var request = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        return try await perform(request)
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)
        if let http = response as? HTTPURLResponse {
            switch http.statusCode {
            case 401: throw APIError.unauthorized
            case 403: throw APIError.forbidden
            case 404: throw APIError.notFound
            case 400...499:
                let body = try? decoder.decode(APIResponse<String>.self, from: data)
                throw APIError.server(body?.error ?? "Request failed")
            case 500...599: throw APIError.server("Server error")
            default: break
            }
        }
        return try decoder.decode(T.self, from: data)
    }
}

// MARK: - Helpers

enum APIError: LocalizedError {
    case unauthorized, forbidden, notFound
    case server(String)

    var errorDescription: String? {
        switch self {
        case .unauthorized: return "Please sign in to continue."
        case .forbidden: return "You don't have permission."
        case .notFound: return "Not found."
        case .server(let msg): return msg
        }
    }
}

private struct EmptyBody: Encodable {}

private extension String {
    var urlEncoded: String {
        addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? self
    }
}
