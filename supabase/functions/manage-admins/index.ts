import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check caller is admin
    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!callerRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // LIST: get all admins
    if (req.method === "GET" && action === "list") {
      const { data: roles } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role");

      const adminUserIds = (roles || [])
        .filter((r: any) => r.role === "admin")
        .map((r: any) => r.user_id);

      const admins = [];
      for (const uid of adminUserIds) {
        const { data } = await supabaseAdmin.auth.admin.getUserById(uid);
        if (data?.user) {
          admins.push({
            id: data.user.id,
            email: data.user.email,
            created_at: data.user.created_at,
          });
        }
      }

      return new Response(JSON.stringify({ admins }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SEARCH: find user by email
    if (req.method === "GET" && action === "search") {
      const email = url.searchParams.get("email");
      if (!email) {
        return new Response(JSON.stringify({ error: "Email required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const found = users.filter((u: any) =>
        u.email?.toLowerCase().includes(email.toLowerCase())
      );

      const results = [];
      for (const u of found.slice(0, 10)) {
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id)
          .eq("role", "admin")
          .maybeSingle();

        results.push({
          id: u.id,
          email: u.email,
          is_admin: !!roleData,
        });
      }

      return new Response(JSON.stringify({ users: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PROMOTE: add admin role
    if (req.method === "POST") {
      const body = await req.json();
      const { user_id, action: bodyAction } = body;

      if (!user_id || !bodyAction) {
        return new Response(
          JSON.stringify({ error: "user_id and action required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (bodyAction === "promote") {
        const { error } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id, role: "admin" }, { onConflict: "user_id,role" });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (bodyAction === "demote") {
        // Prevent self-demotion
        if (user_id === caller.id) {
          return new Response(
            JSON.stringify({ error: "Cannot remove your own admin role" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", user_id)
          .eq("role", "admin");

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});