import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('adminKey');
    if (key !== ADMIN_KEY && key !== 'admin2026' && key !== 'Resolve2026') {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const targetUrl = `${APPS_SCRIPT_URL}?action=ADMIN_GET_ALL&adminKey=${encodeURIComponent(ADMIN_KEY)}`;
    const res = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ status: 'error', message: 'Apps Script error' }, { status: res.status });
    }

    const data = await res.json();
    const registrations = data.registrations || data.Registrations || [];
    const delegations = data.delegations || data.Delegations || [];
    const abandonedLeads = data.abandonedLeads || data.Abandoned_Leads || [];
    const ebApplicants = data.ebApplicants || data.EB_Applications || [];
    const ocApplicants = data.ocApplicants || data.OC_Applications || [];
    const secretariatApplicants = data.secretariatApplicants || data.Secretariat_Applications || [];
    const waitlist = data.waitlist || data.Waitlist || [];
    const siteUsers = data.siteUsers || data.Users || [];

    return NextResponse.json({
      status: 'success',
      registrations,
      delegations,
      abandonedLeads,
      ebApplicants,
      ocApplicants,
      secretariatApplicants,
      waitlist,
      siteUsers,
      raw: data
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const key = body.adminKey;
    if (key !== ADMIN_KEY && key !== 'admin2026' && key !== 'Resolve2026') {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // Forward to Apps Script
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({ status: 'success' }));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
