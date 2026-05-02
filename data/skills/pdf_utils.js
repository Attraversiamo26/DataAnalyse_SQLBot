const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findLibreOffice() {
    const candidates = [
        'libreoffice',
        'soffice',
        '/Applications/LibreOffice.app/Contents/MacOS/soffice',
        path.join(__dirname, '..', '..', '.libreoffice', 'LibreOffice.app', 'Contents', 'MacOS', 'soffice'),
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
        '/usr/bin/libreoffice',
        '/usr/bin/soffice'
    ];
    for (const cmd of candidates) {
        if (path.isAbsolute(cmd)) {
            if (fs.existsSync(cmd)) return cmd;
        } else {
            try {
                const result = execSync(`which ${cmd} 2>/dev/null`, { encoding: 'utf8' }).trim();
                if (result) return result;
            } catch (e) {}
        }
    }
    return null;
}

function convertToPdf(inputPath, outputDir) {
    const loCmd = findLibreOffice();
    if (!loCmd) {
        console.error('LibreOffice未安装，无法转换PDF');
        return null;
    }
    try {
        const cmd = `"${loCmd}" --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
        execSync(cmd, { timeout: 120000, stdio: 'pipe' });
        const pdfPath = path.join(outputDir, path.basename(inputPath, path.extname(inputPath)) + '.pdf');
        if (fs.existsSync(pdfPath)) {
            console.log('PDF文档已保存（LibreOffice）: ' + pdfPath);
            return pdfPath;
        }
        return null;
    } catch (e) {
        console.error('LibreOffice转换失败: ' + e.message);
        return null;
    }
}

module.exports = { findLibreOffice, convertToPdf };
