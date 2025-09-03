/**
 * Copyright (C) 2021-2025 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

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
