import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
    // 1. Verificar se é um POST
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const payload = await req.json();
        console.log("Recebendo Webhook LastLink:", JSON.stringify(payload, null, 2));

        // O LastLink envia informações de pagamento. 
        // Vamos procurar pelo e-mail do cliente e pelo status.
        // Baseado em padrões comuns do LastLink:
        const email = payload.payer_email || payload.email || payload.customer?.email;
        const status = payload.status; // 'APPROVED', 'PAID', 'authorized'
        const event = payload.event; // 'PAYMENT_CONFIRMED' etc

        if (!email) {
            return new Response("Email not found in payload", { status: 400 });
        }

        // Lógica de Desbloqueio:
        // Se o status for de aprovação (ajuste conforme a documentação específica do LastLink)
        const isApproved =
            status === "APPROVED" ||
            status === "PAID" ||
            status === "authorized" ||
            event === "PAYMENT_CONFIRMED";

        if (isApproved) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            const { error } = await supabase
                .from("profiles")
                .update({ subscription_status: "active" })
                .eq("email", email);

            if (error) {
                console.error("Erro ao atualizar perfil:", error);
                return new Response("Error updating profile", { status: 500 });
            }

            console.log(`Assinatura ativada para: ${email}`);
            return new Response(JSON.stringify({ message: `Success for ${email}` }), {
                headers: { "Content-Type": "application/json" },
                status: 200,
            });
        }

        return new Response(JSON.stringify({ message: "Received, but not an approval status" }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        console.error("Erro no processamento do webhook:", err.message);
        return new Response("Internal Server Error", { status: 500 });
    }
});
