import {
  ClientVpnEndpoint,
  EC2Client,
  DescribeClientVpnEndpointsCommand,
  DescribeClientVpnTargetNetworksCommand,
  DisassociateClientVpnTargetNetworkCommand,
  DescribeClientVpnConnectionsCommand,
} from '@aws-sdk/client-ec2';

const ec2Client: EC2Client = new EC2Client({ region: process.env.AWS_REGION! });

const hasActiveConnections = async (endpointId: string) => {
  const connections = await ec2Client.send(
    new DescribeClientVpnConnectionsCommand({
      ClientVpnEndpointId: endpointId,
    }),
  );

  const activeConnections = connections.Connections?.filter(
    connection => connection.Status?.Code === 'active',
  );

  return !!activeConnections?.length;
};

const disassociateTargetNetwork = async (endpointId: string, associationId: string) => {
  if (await hasActiveConnections(endpointId)) {
    console.log(
      `Endpoint: ${endpointId} has active connections, skipping disassociation`,
    );
    return;
  }

  console.log(`Disassociating association: ${associationId}`);
  await ec2Client.send(
    new DisassociateClientVpnTargetNetworkCommand({
      ClientVpnEndpointId: endpointId,
      AssociationId: associationId,
    }),
  );
};

const processEndpoint = async (endpoint: ClientVpnEndpoint) => {
  const env: string = process.env.VPN_ENV || process.env.NODE_ENV!;
  console.log(`Environment: ${env}, Processing endpoint: ${endpoint.Description}`);
  if (!endpoint.Description?.includes(env)) return;

  const associations = await ec2Client.send(
    new DescribeClientVpnTargetNetworksCommand({
      ClientVpnEndpointId: endpoint.ClientVpnEndpointId,
    }),
  );

  if (associations.ClientVpnTargetNetworks) {
    await Promise.all(
      associations.ClientVpnTargetNetworks.map(async association => {
        console.log(
          `Processing association: ${association.AssociationId} with status: ${association.Status?.Code}`,
        );

        if (association.Status?.Code !== 'associated') return;
        await disassociateTargetNetwork(
          endpoint.ClientVpnEndpointId!,
          association.AssociationId!,
        );
      }),
    );
  }
};

export const handler = async () => {
  const command = new DescribeClientVpnEndpointsCommand({});
  const endpoints = await ec2Client.send(command);

  if (endpoints.ClientVpnEndpoints) {
    await Promise.all(endpoints.ClientVpnEndpoints.map(processEndpoint));
  }
};
