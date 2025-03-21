import {
  AssociateClientVpnTargetNetworkCommand,
  EC2Client,
  DescribeClientVpnTargetNetworksCommand,
} from '@aws-sdk/client-ec2';

const ec2Client: EC2Client = new EC2Client({ region: process.env.AWS_REGION! });
const subnetIds: string[] = JSON.parse(process.env.SUBNET_IDS!);
const endpointId: string = process.env.CLIENT_VPN_ENDPOINT_ID!;

const alreadyAssociated = async (endpointIdToCheck: string, subnetId: string) => {
  const networks = await ec2Client.send(
    new DescribeClientVpnTargetNetworksCommand({
      ClientVpnEndpointId: endpointIdToCheck,
    }),
  );

  return networks.ClientVpnTargetNetworks?.some(
    network => network.TargetNetworkId === subnetId,
  );
};

const associateTargetNetwork = async (subnetId: string) => {
  if (await alreadyAssociated(endpointId, subnetId)) {
    console.log(
      `Endpoint: ${endpointId} is already associated with subnet: ${subnetId}, skipping association`,
    );
    return;
  }

  console.log(`Associating endpoint: ${endpointId} with subnet: ${subnetId}`);
  await ec2Client.send(
    new AssociateClientVpnTargetNetworkCommand({
      ClientVpnEndpointId: endpointId,
      SubnetId: subnetId,
    }),
  );
};

export const handler = async () => {
  for (const subnetId of subnetIds) {
    await associateTargetNetwork(subnetId);
  }
};
