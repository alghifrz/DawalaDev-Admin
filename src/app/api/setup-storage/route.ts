import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up storage bucket...')
    
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.email)

    // First, check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json({ error: 'Failed to check storage buckets' }, { status: 500 })
    }

    console.log('Existing buckets:', buckets?.map(b => b.name))

    const bucketExists = buckets?.some(bucket => bucket.name === 'makanan-images')
    
    if (bucketExists) {
      console.log('Bucket makanan-images already exists')
      return NextResponse.json({ 
        message: 'Storage bucket already exists',
        bucket: 'makanan-images'
      })
    }

    console.log('Creating bucket makanan-images...')

    // Create bucket with minimal configuration first
    const { data: bucket, error: createError } = await supabase.storage.createBucket('makanan-images', {
      public: true
    })

    if (createError) {
      console.error('Error creating bucket:', createError)
      
      // If bucket already exists error, return success
      if (createError.message?.includes('already exists')) {
        return NextResponse.json({ 
          message: 'Storage bucket already exists',
          bucket: 'makanan-images'
        })
      }
      
      return NextResponse.json({ 
        error: `Failed to create storage bucket: ${createError.message}` 
      }, { status: 500 })
    }

    console.log('Bucket created successfully:', bucket)

    // Try to update bucket with additional settings
    try {
      const { error: updateError } = await supabase.storage.updateBucket('makanan-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (updateError) {
        console.warn('Warning: Could not update bucket settings:', updateError)
        // Don't fail the request, bucket was created successfully
      }
    } catch (updateError) {
      console.warn('Warning: Could not update bucket settings:', updateError)
    }

    return NextResponse.json({ 
      message: 'Storage bucket created successfully',
      bucket: 'makanan-images'
    })

  } catch (error) {
    console.error('Setup storage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
