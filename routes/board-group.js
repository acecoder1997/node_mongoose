const express = require('express');
const {mongodb, Model} = require('../data_base/mongodb/index');
const board_group = require('../data_base/mongodb/model/board_group');
const router = express.Router();
const boardGroupModel = new Model(board_group.name, board_group.model);

// mongodb connection
mongodb.then(res => {
    router.get('/', (req, res, next) => {
        res.send('SUCCESS GET /boardGroup');
    })

    // 获取看板分组列表
    router.get('/list', (req, res, next) => {
        let filters = {}
        let query = Object.assign(req.query)
        let {pageNo, pageSize} = query

        if (query.groupName) {
            filters.name = new RegExp(`${query.groupName}`)
        }

        if (query.id) {
            filters.id = query.id
        }

        let limit = (pageSize || 20) * 1
        let page = ((pageNo || 1) - 1) * limit
        boardGroupModel.aggregate([{$match: filters}, {
            $project: {
                id: "$_id",
                name: 1,
                date: 1,
                _id: 0
            }
        }, {$skip: page}, {$limit: limit}]).then((data, error) => {
            boardGroupModel.find(filters).countDocuments({}).then(total => {
                res.send({
                    code: 200,
                    result: {
                        records: data,
                        current: (query.pageNo || 1) * 1,
                        size: limit,
                        total: total || 0,
                    },
                    success: true
                })
            })
        })
    })

    // 看板分组新增
    router.post('/add', (req, res, next) => {
        let body = req.body
        boardGroupModel.create(body).then(data => {
            res.send({
                code: 200,
                result: data,
                message: `保存成功！`,
                success: true
            });
        }).catch((err) => {
            console.log(`新增数据失败${err}`)
            res.send({
                code: 500,
                message: `新增数据失败：${err.message}`,
                success: false
            });
        })
    })

    // 看板分组编辑
    router.put('/edit', (req, res, next) => {
        console.log(req.body);
        let body = req.body
        if (!body.id) {
            res.send({
                code: 500,
                message: `修改数据失败：id不能为空！`,
            });
            return
        }

        if (body.imgSrc) body.img_src = body.imgSrc

        if (body.groupId) {
            body.group = {
                id: body.groupId,
                name: body.groupName
            }
        }

        boardGroupModel.updateOne({_id: body.id}, {$set: body}).then(data => {
            res.send({
                code: 200,
                result: data,
                message: `编辑成功！`,
                success: true
            });
        }).catch((err) => {
            console.log(`编辑数据失败${err}`)
            res.send({
                code: 500,
                message: `编辑数据失败：${err.message}`,
                success: false
            });
        })
    })

    // 看板分组删除
    router.delete('/delete', (req, res, next) => {
        let query = req.query

        if (!query.id) {
            res.send({
                code: 500,
                message: `删除数据失败：id不能为空！`,
            });
            return
        }
        boardGroupModel.deleteOne({_id: query.id}).then(data => {
            res.send({
                code: 200,
                result: data,
                message: `删除成功！`,
                success: true
            });
        }).catch((err) => {
            console.log(`删除数据失败${err}`)
            res.send({
                code: 500,
                message: `删除数据失败：${err.message}`,
                success: false
            });
        })
    })
}).catch(err => {
    console.log(`mongodb连接失败：${err}`)
});

module.exports = router
