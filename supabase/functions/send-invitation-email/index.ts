import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify the calling user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { invitedEmail, projectId, role } = await req.json()

    if (!invitedEmail || !projectId || !role) {
      return new Response(JSON.stringify({ error: 'Paramètres manquants' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch project title
    const { data: project } = await supabase
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single()

    // Fetch inviter display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    const projectTitle = project?.title || 'un projet'
    const inviterName = profile?.display_name || 'Un utilisateur'
    const roleLabel = role === 'editor' ? 'éditeur' : 'lecteur'

    const appUrl = Deno.env.get('PLUME_APP_URL') || 'http://localhost:5173'
    const resendKey = Deno.env.get('RESEND_API_KEY')

    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'Clé Resend non configurée' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const subject = `${inviterName} vous invite à collaborer sur « ${projectTitle} »`

    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 0;">
<div style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Plume</h1>
  </div>
  <div style="padding: 32px;">
    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 0;">Bonjour,</p>
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      <strong>${inviterName}</strong> vous invite à rejoindre le projet
      « <strong>${projectTitle}</strong> » en tant que <strong>${roleLabel}</strong>.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}"
        style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none;
        padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
        Rejoindre le projet
      </a>
    </div>
    <p style="font-size: 14px; color: #6b7280; line-height: 1.5; background: #f3f4f6; padding: 16px; border-radius: 8px;">
      Inscrivez-vous avec l'adresse <strong>${invitedEmail}</strong>
      pour accéder automatiquement au projet.
    </p>
  </div>
  <div style="padding: 16px 32px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">Envoyé depuis Plume — Votre atelier d'écriture</p>
  </div>
</div>
</body></html>`

    // Send via Resend API
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Plume <onboarding@resend.dev>',
        to: [invitedEmail],
        subject,
        html,
      }),
    })

    if (!resendRes.ok) {
      const errorBody = await resendRes.text()
      console.error('Resend error:', errorBody)
      return new Response(JSON.stringify({ error: 'Échec de l\'envoi de l\'email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Erreur interne' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
