<template>
    <div class="">
        <h1>{{ 'Sjowme dashboard' | trans }}</h1>

        <div class="uk-grid uk-grid-width-medium-1-3" data-uk-grid-margin>
            <div>
                <div class="uk-panel uk-panel-box uk-panel-box-primary uk-text-center">
                    <div v-if="viewdata.stats" class="uk-panel-badge uk-badge"
                         :class="viewdata.stats.server.env == 'production'? 'uk-badge-success' :'uk-badge-warning'">
                        {{ viewdata.stats.server.env }}
                    </div>
                    <h3 class="uk-panel-title">{{ 'Server status' | trans }}</h3>
                    <dl>
                        <dt>{{ 'Geheugengebruik' | trans }}</dt>
                        <dd>
                            <div class="uk-progress uk-margin-small-bottom uk-margin-small-top" :class="memory_status">
                                <div class="uk-progress-bar" :style="`width: ${memory_usage}%;`">{{memory_usage}}%</div>
                            </div>
                        </dd>
                        <template v-if="viewdata.stats">
                            <dd>{{ viewdata.stats.server.memory.heapTotal | filesize }}</dd>
                            <dt>{{ 'Systeem' | trans }}</dt>
                            <dd>{{ viewdata.stats.server.platform }}</dd>
                            <dt>{{ 'Up time' | trans }}</dt>
                            <dd>{{ (viewdata.stats.server.uptime * 1000) | relTime }}</dd>
                        </template>

                    </dl>
                </div>
            </div>
            <div>
                <div class="uk-panel uk-panel-box uk-text-center">
                    <h3 class="uk-panel-title">{{ '# schermen' | trans }}</h3>
                    <h1><template v-if="viewdata.stats">{{ viewdata.stats.screens }}</template></h1>
                </div>
            </div>
            <div>
                <div class="uk-panel uk-panel-box uk-panel-box-secondary uk-text-center">
                    <h3 class="uk-panel-title">{{ '# gebruikers' | trans }}</h3>
                    <h1><template v-if="viewdata.stats">{{ viewdata.stats.members }}</template></h1>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

    module.exports = {

        props: ['viewdata'],

        data() {
            return {
            }
        },

        events: {
            'global.broadcast': function (data) {
                if (data.stats) {
                    this.viewdata.stats = data.stats;
                }
            }
        },

        computed: {
            memory_usage() {
                if (!this.viewdata.stats) {
                    return 0;
                }
                return Math.round((this.viewdata.stats.server.memory.heapUsed / this.viewdata.stats.server.memory.heapTotal) * 100)
            },
            memory_status() {
                if (this.memory_usage < 70) {
                    return 'uk-progress-success';
                }
                if (this.memory_usage < 90) {
                    return 'uk-progress-warning';
                }
                return 'uk-progress-danger';
            }
        }

    };

</script>