import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the caller's ID token
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const callerUid = decodedToken.uid;

    // Verify caller is an active super_admin in Firestore
    const callerDoc = await adminDb().collection('admins').doc(callerUid).get();
    if (!callerDoc.exists) {
      return NextResponse.json({ error: 'Caller admin document not found' }, { status: 403 });
    }
    
    const callerData = callerDoc.data();
    if (!callerData?.active || callerData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized: Only active super_admins can perform this action' }, { status: 403 });
    }

    // Parse the request body for the new admin's details
    const body = await request.json();
    const { email, name, role, faculties, password } = body;

    if (!email || !name || !role || !faculties) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create the Firebase Auth user securely on the server
    const userRecord = await adminAuth().createUser({
      email,
      password: password || 'DefaultPass123!', // Require a secure password or generate one
      displayName: name,
    });

    // 2. Create the admin document in Firestore
    const newAdminData = {
      uid: userRecord.uid,
      name,
      email,
      role,
      faculties: (faculties || []).map((f: string) => f.toLowerCase()),
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: callerUid
    };

    await adminDb().collection('admins').doc(userRecord.uid).set(newAdminData);

    return NextResponse.json({ success: true, admin: newAdminData });
  } catch (error: any) {
    console.error('API /admin POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
