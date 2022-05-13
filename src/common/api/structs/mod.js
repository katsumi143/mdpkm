import Project from './project';
export default class Mod extends Project {
    getSide() {
        const client = this.data.client_side, server = this.data.server_side;
        if(client !== 'unsupported' && server !== 'unsupported')
            return 'Universal'
        if(client !== 'unsupported')
            return 'Client';
        if(server !== 'unsupported')
            return 'Server';
        return 'Unavailable';
    }
};