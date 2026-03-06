/** Generates the welcome email HTML sent after plan generation. */
export function welcomeEmailHtml(userName: string | null, dashboardUrl: string): string {
  const name = userName ?? "there";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin-bottom: 16px;">
        Welcome to NextNest, ${name}!
      </h1>
      <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 8px;">
        Your personalized relocation plan is ready. We've mapped out your timeline, estimated your budget, and set milestones to keep you on track.
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 32px;">
        Your NextNest is waiting — and now you're on your way.
      </p>
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #0d9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
        View My Dashboard
      </a>
      <p style="color: #999; font-size: 13px; margin-top: 32px; line-height: 1.5;">
        Save this email — you can always access your dashboard from the link above.
      </p>
    </div>
  `;
}

/** Generates a milestone reminder email HTML. */
export function reminderEmailHtml(
  userName: string | null,
  milestones: { title: string; targetDate: string }[],
  dashboardUrl: string
): string {
  const name = userName ?? "there";
  const milestoneHtml = milestones
    .map(
      (m) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #eee;">
            <strong style="color: #1a1a1a;">${m.title}</strong>
            <br />
            <span style="color: #888; font-size: 13px;">Target: ${new Date(m.targetDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin-bottom: 16px;">
        Hi ${name}, here's your move update
      </h1>
      <p style="color: #555; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
        You have ${milestones.length} upcoming milestone${milestones.length === 1 ? "" : "s"} to focus on:
      </p>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin-bottom: 32px;">
        ${milestoneHtml}
      </table>
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #0d9488; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
        View My Dashboard
      </a>
      <p style="color: #999; font-size: 13px; margin-top: 32px;">
        You're making progress — keep it going!
      </p>
    </div>
  `;
}
