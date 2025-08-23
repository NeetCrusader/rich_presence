import Elysia from "elysia";
import { client } from "..";
import { sendPresence } from "../utils/PresenceUtils";

let socket_map = new Map<string, string>();

export const PresenceRouter = new Elysia({ prefix: "/presence" })
    .ws('/:id', {
        async open(ws) {
            const userId = ws.data.params.id as string;
            const guild = client.guilds.cache.get(process.env.GUILD_ID!);
            if (!guild) {
                ws.send(JSON.stringify({ error: "Guild not found" }));
                ws.close();
                return;
            }

            const guildMember = guild.members.cache.get(userId);
            if (!guildMember) {
                ws.send(JSON.stringify({ error: "User not found in guild" }));
                ws.close();
                return;
            }

            ws.subscribe(userId);
            socket_map.set(ws.id, userId);

            let newPresence = guildMember.presence;
            sendPresence(guildMember, newPresence, ws, true);
        },
        async message(ws, message) {
            if (message === "ping") {
                ws.send("pong");
            }
        },
        async close(ws) {
            if (socket_map.has(ws.id)) {
                let discord_id = socket_map.get(ws.id)!;
                ws.unsubscribe(discord_id);
                socket_map.delete(ws.id);
            }
        },
    })
    .get('/:id', async ({ params }) => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID!);
        if (!guild) return { error: "Guild not found" };

        const guildMember = guild.members.cache.get(params.id);
        if (!guildMember) return { error: "User not found in guild" };

        let newPresence = guildMember.presence;
        if (!newPresence) {
            return { error: "Presence not available (user offline or intent missing)" };
        }

        let presenceObject = await new Promise((resolve) =>
            sendPresence(guildMember, newPresence, { send: (data: string) => resolve(JSON.parse(data)) }, true)
        );

        return presenceObject;
    });
