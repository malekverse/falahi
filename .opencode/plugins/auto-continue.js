export const AutoContinuePlugin = async ({ client }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await client.session.prompt({
          path: { id: event.properties.sessionID },
          body: {
            parts: [{ type: "text", text: "Continue the build loop exactly as defined in OPENCODE.md. Do not stop." }],
          },
        })
      }
    },
  }
}
