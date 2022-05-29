import Project from './project';
export default class Mod extends Project {
    getSide() {
        const client = this.data.client_side, server = this.data.server_side;
        if(!client)
            return 'unknown';
        if(client !== 'unsupported' && server !== 'unsupported')
            return 'universal'
        if(client !== 'unsupported')
            return 'client';
        if(server !== 'unsupported')
            return 'server';
        return 'unavailable';
    }
};