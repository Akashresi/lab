const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Cleanup helper
const cleanup = (files) => {
    files.forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
    });
};

const EXECUTION_TIMEOUT = 5000; // 5s timeout

const runProcess = (cmd, args, input, timeout = EXECUTION_TIMEOUT) => {
    return new Promise((resolve) => {
        const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });

        let stdout = '';
        let stderr = '';
        let killed = false;

        const timer = setTimeout(() => {
            killed = true;
            child.kill();
        }, timeout);

        child.stdin.write(input);
        child.stdin.end();

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            clearTimeout(timer);
            const duration = Date.now() - (timer._idleStart || Date.now()); // rough estimate
            if (killed) {
                resolve({ output: '', error: 'Time Limit Exceeded', time: timeout, status: 'TLE' });
            } else {
                resolve({ output: stdout.trim(), error: stderr.trim(), time: 0, status: code === 0 ? 'OK' : 'Runtime Error' });
            }
        });

        child.on('error', (err) => {
            clearTimeout(timer);
            resolve({ output: '', error: err.message, time: 0, status: 'Runtime Error' });
        });
    });
};

const executeCode = async (language, code, input) => {
    const id = uuidv4();
    const startTime = Date.now();
    let result = { output: '', error: '', status: 'Pending', time: 0 };

    // File paths
    let sourceFile, execFile;

    try {
        switch (language.toLowerCase()) {
            case 'javascript':
                sourceFile = path.join(TEMP_DIR, `${id}.js`);
                fs.writeFileSync(sourceFile, code);
                result = await runProcess('node', [sourceFile], input);
                cleanup([sourceFile]);
                break;

            case 'python':
                sourceFile = path.join(TEMP_DIR, `${id}.py`);
                fs.writeFileSync(sourceFile, code);
                // Try python3, fallback to python
                result = await runProcess('python', [sourceFile], input);
                cleanup([sourceFile]);
                break;

            case 'java':
                sourceFile = path.join(TEMP_DIR, `Main.java`); // Java needs specific filename class match
                // We need unique dir for Java to avoid collision if concurrent
                const javaDir = path.join(TEMP_DIR, id);
                fs.mkdirSync(javaDir);
                const javaSource = path.join(javaDir, 'Main.java');
                fs.writeFileSync(javaSource, code);

                // Compile
                const compile = await runProcess('javac', [javaSource], '');
                if (compile.status !== 'OK') {
                    result = { output: '', error: compile.error, status: 'Compilation Error' };
                } else {
                    // Run
                    result = await runProcess('java', ['-cp', javaDir, 'Main'], input);
                }

                // Cleanup dir
                fs.rmSync(javaDir, { recursive: true, force: true });
                break;

            case 'c':
                sourceFile = path.join(TEMP_DIR, `${id}.c`);
                execFile = path.join(TEMP_DIR, `${id}.exe`);
                fs.writeFileSync(sourceFile, code);

                const cCompile = await runProcess('gcc', [sourceFile, '-o', execFile], '');
                if (cCompile.status !== 'OK') {
                    result = { output: '', error: cCompile.error, status: 'Compilation Error' };
                } else {
                    result = await runProcess(execFile, [], input);
                }
                cleanup([sourceFile, execFile]);
                break;

            case 'cpp':
            case 'c++':
                sourceFile = path.join(TEMP_DIR, `${id}.cpp`);
                execFile = path.join(TEMP_DIR, `${id}.exe`);
                fs.writeFileSync(sourceFile, code);

                const cppCompile = await runProcess('g++', [sourceFile, '-o', execFile], '');
                if (cppCompile.status !== 'OK') {
                    result = { output: '', error: cppCompile.error, status: 'Compilation Error' };
                } else {
                    result = await runProcess(execFile, [], input);
                }
                cleanup([sourceFile, execFile]);
                break;

            default:
                result = { output: '', error: 'Language not supported', status: 'Error' };
        }
    } catch (e) {
        result = { output: '', error: e.message, status: 'System Error' };
    }

    result.time = Date.now() - startTime;
    return result;
};

module.exports = { executeCode };
