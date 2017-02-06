
module.exports = (knex, lib) => {

    return {
        all() {
            return knex('config').select('name', 'data').then((results) => {
                var dir = {};
                results.forEach(config => {
                    dir[config.name] = config.data;
                });
                return dir;
            });
        },
        load(name) {
            return knex('config').where({name}).first('data').then(res => {
                if (!res) {
                    return {};
                }
                return res.data;
            });
        },
        save: (name, data) => {
            return knex('config').where({name}).first('id').then(res => {
                if (res) {
                    return knex('config').where({id: res.id}).update({data});
                } else {
                    return knex('config').insert({name, data});
                }
            });

        },
        delete: name => knex('config').where('name', name).del()
    };
};