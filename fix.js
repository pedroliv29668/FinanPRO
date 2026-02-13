
const fs = require('fs');
const path = 'App.tsx';

try {
    console.log("Reading file...");
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split('\n');
    console.log(`Read ${lines.length} lines`);

    let idx_return = -1;
    let idx_dash_start = -1;
    let idx_dash_end = -1;
    let idx_return_end = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('return (') && i > 480 && i < 500) {
            idx_return = i;
            console.log(`Found return at ${i}`);
        }
        if (line.includes('<Route path="/app/*" element={')) {
            idx_dash_start = i + 1;
            console.log(`Found dashboard start at ${i + 1}`);
        }
        if (line.includes('</ProtectedRoute>') && i > 1300) {
            idx_dash_end = i;
            console.log(`Found dashboard end at ${i}`);
        }
        if (line.includes(');') && i > 1330) {
            idx_return_end = i;
            console.log(`Found return end at ${i}`);
        }
    }

    if (idx_return === -1 || idx_dash_start === -1 || idx_dash_end === -1 || idx_return_end === -1) {
        console.error('Indices not found');
        process.exit(1);
    }

    const newLines = [
        ...lines.slice(0, idx_return),
        '',
        "  const isAppSubdomain = window.location.hostname.startsWith('app');",
        '',
        '  const DashboardContent = (',
        ...lines.slice(idx_dash_start, idx_dash_end + 1),
        '  );',
        '',
        '  return (',
        '    <Routes>',
        '      <Route path="/" element={isAppSubdomain ? DashboardContent : <LandingPage isAuthenticated={isAuthenticated} userEmail={userEmail} />} />',
        '      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthScreen appName={appName} appColor={appColor} />} />',
        '      <Route path="/app/*" element={isAppSubdomain ? <Navigate to="/" replace /> : DashboardContent} />',
        '      <Route path="*" element={<Navigate to="/" replace />} />',
        '    </Routes>',
        '  );',
        ...lines.slice(idx_return_end + 1)
    ];

    fs.writeFileSync(path, newLines.join('\n'), 'utf8');
    console.log('Success rewriting App.tsx');

} catch (err) {
    console.error(err);
    process.exit(1);
}
