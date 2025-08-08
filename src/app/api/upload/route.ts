import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called')
    
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }

    if (!user) {
      console.error('No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.email)

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    console.log('Files received:', files.length)
    
    if (!files || files.length === 0) {
      console.error('No files provided')
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        console.error('Invalid file type:', file.type)
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed types: ${validTypes.join(', ')}` },
          { status: 400 }
        )
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File too large:', file.size)
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 5MB` },
          { status: 400 }
        )
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      console.log('File converted to base64, length:', dataUrl.length)
      uploadedUrls.push(dataUrl)
    }

    console.log('All files processed successfully:', uploadedUrls.length)

    return NextResponse.json({ 
      urls: uploadedUrls,
      message: 'Files uploaded successfully' 
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
