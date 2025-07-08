
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface EmailRequest {
  to: string
  name?: string
  companyName?: string
  totalScore: number
  reportUrl: string
  assessmentId: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const body: EmailRequest = await req.json()
    
    if (!body.to || !body.totalScore || !body.reportUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, totalScore, reportUrl' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Determine readiness level
    const getReadinessLevel = (score: number) => {
      if (score >= 750) return { level: 'Investment Ready', color: '#10B981' }
      if (score >= 600) return { level: 'Nearly Ready', color: '#3B82F6' }
      if (score >= 400) return { level: 'Developing', color: '#F59E0B' }
      return { level: 'Early Stage', color: '#EF4444' }
    }

    const readiness = getReadinessLevel(body.totalScore)

    // Create email content
    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Investment Readiness Report</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .score-badge { display: inline-block; background: ${readiness.color}; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .cta-button { display: inline-block; background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Investment Readiness Report</h1>
          <p>Your startup assessment results are ready!</p>
        </div>
        
        <div class="content">
          <p>Hello ${body.name || 'there'},</p>
          
          <p>Thank you for completing the Investment Readiness Assessment${body.companyName ? ` for ${body.companyName}` : ''}. Your results are now available!</p>
          
          <div style="text-align: center;">
            <h2>Your Overall Score</h2>
            <div style="font-size: 48px; font-weight: bold; color: ${readiness.color};">${body.totalScore}/999</div>
            <div class="score-badge">${readiness.level}</div>
          </div>
          
          <p>Your comprehensive report includes:</p>
          <ul>
            <li>✅ Detailed breakdown across all assessment categories</li>
            <li>📊 Personalized recommendations for improvement</li>
            <li>🎯 Next steps to enhance your investment readiness</li>
            <li>📈 Benchmarking against similar startups</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${body.reportUrl}" class="cta-button">View Your Full Report</a>
          </div>
          
          <p>Keep this email for your records - you can access your report anytime using the link above.</p>
          
          <p>Questions about your results? Feel free to reach out to our team.</p>
          
          <p>Best of luck with your startup journey!</p>
          
          <p><strong>The Investment Readiness Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This assessment is for informational purposes only and does not constitute financial advice.</p>
          <p>Assessment ID: ${body.assessmentId}</p>
        </div>
      </div>
    </body>
    </html>
    `

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Investment Readiness <noreply@investmentreadiness.app>',
        to: [body.to],
        subject: `Your Investment Readiness Score: ${body.totalScore}/999 - ${readiness.level}`,
        html: emailContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      throw new Error(`Failed to send email: ${emailResponse.status}`)
    }

    const result = await emailResponse.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-report-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
