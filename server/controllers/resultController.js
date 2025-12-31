const { Result, User, Quiz, CodeChallenge, TimeLog } = require('../models');
const ExcelJS = require('exceljs');

// @desc    Get user results
// @route   GET /api/results
// @access  Private
exports.getResults = async (req, res) => {
    try {
        const { type } = req.query; // 'quiz' or 'challenge'
        const whereClause = { user_id: req.user.id };

        if (type) {
            whereClause.type = type;
        }

        const results = await Result.findAll({
            where: whereClause,
            include: [
                { model: Quiz, attributes: ['title'] },
                { model: CodeChallenge, attributes: ['title'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Export results to Excel
// @route   GET /api/results/export
// @access  Private
exports.exportResults = async (req, res) => {
    try {
        const whereClause = { user_id: req.user.id };
        if (req.user.role === 'admin') {
            // Admin can see all? Or maybe strict user export for now.
            // If user asks "Admin / User can: Export their results", implies own results usually unless stated otherwise.
            // "Admin / User can: Export their results" -> implies own.
            // If admin wants all, that's a different feature effectively. I'll stick to own results to be safe, or allow admin to export all?
            // Prompt: "Admin / User can: Export their results" -> "their" implies own.
        }

        const results = await Result.findAll({
            where: whereClause,
            include: [
                { model: User, attributes: ['username', 'email'] },
                { model: Quiz, attributes: ['title'] },
                { model: CodeChallenge, attributes: ['title'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Results');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Score', key: 'score', width: 10 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Time Taken (s)', key: 'time', width: 15 },
        ];

        results.forEach(r => {
            worksheet.addRow({
                date: r.createdAt.toISOString().split('T')[0],
                username: r.User.username,
                email: r.User.email,
                type: r.type,
                title: r.type === 'quiz' ? (r.Quiz ? r.Quiz.title : 'Deleted Quiz') : (r.CodeChallenge ? r.CodeChallenge.title : 'Deleted Challenge'),
                score: `${r.score}/${r.total_score}`,
                status: r.status,
                time: r.time_taken
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=results.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Export Failed' });
    }
};
