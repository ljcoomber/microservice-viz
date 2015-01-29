type Url = string

type Thunk = () => void

type ServiceId = string;

type NetworkId = string;

type ConnectionId = string;

enum Status {
    Unknown,
    Checking,
    CannotConnect,
    Err,
    Ok
}

class Connection {
    constructor(public source: Service, public target: Service) {}

    id(): ConnectionId {
        return `${this.source.id}-${this.target.id}`;
    }
}

interface Service {
    id: ServiceId;
    network?: NetworkId
}

class ServiceInstance implements Service {
    constructor(public id: ServiceId, public url: Url, public logicalService: Service = null, public network: NetworkId = "external") {}
}

class RemoteInstance implements Service {
    constructor(public id: ServiceId, public network: NetworkId = "external") {}
}

class LogicalService implements Service {
    constructor(public id: ServiceId, public instances: ServiceInstance[], public network: NetworkId = "external") {}
}
