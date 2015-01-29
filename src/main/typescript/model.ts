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

    source: Service;

    target: Service;

    constructor(source: Service, target: Service) {
        this.source = source;
        this.target = target;
    }

    id(): ConnectionId {
        return `${this.source.id}-${this.target.id}`;
    }
}

interface Service {
    id: ServiceId;
    network?: NetworkId
}

class ServiceInstance implements Service {
    id: ServiceId;
    url: Url;
    logicalService: Service;
    network: NetworkId

    constructor(id: ServiceId, url: Url, logicalService: Service = null, network: NetworkId = "external") {
        this.id = id;
        this.url = url;
        this.logicalService = logicalService;
        this.network = network;
    }
}

class RemoteInstance implements Service {
    id: ServiceId;
    network: NetworkId;

    constructor(id: ServiceId, network: NetworkId = "external") {
        this.id = id;
        this.network = network;
    }
}

class LogicalService implements Service {
    id: ServiceId;
    instances: ServiceInstance[];
    network: NetworkId;

    constructor(id: ServiceId, instances: ServiceInstance[], network: NetworkId = "external") {
        this.id = id;
        this.instances = instances;
        this.network = network;
    }
}
