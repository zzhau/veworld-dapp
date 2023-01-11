import {
  Box,
  Button,
  Flex,
  Text,
  Icon,
  Spinner,
  VStack,
  Alert,
  AlertIcon,
  HStack,
} from "@chakra-ui/react"
import { LinkIcon, WalletIcon } from "@heroicons/react/24/solid"
import React, { useState } from "react"
import { ActionType, useWallet } from "../../context/walletContext"
import {
  DEFAULT_NETWORK,
  DEFAULT_SOURCE,
  Network,
  WalletSource,
} from "../../model/enums"
import { connectToWalletHandler } from "../../service/ConnexService"
import { getErrorMessage } from "../../utils/ExtensionUtils"
import AccountSourceRadio from "../Account/AccountSourceRadio/AccountSourceRadio"
import NetworkSelect from "../NetworkSelect/NetworkSelect"
import { Dialog } from "../Shared"

interface IConnectWalletModal {
  isOpen: boolean
  onClose: () => void
}
const ConnectWalletModal: React.FC<IConnectWalletModal> = ({
  isOpen,
  onClose,
}) => {
  const header = (
    <HStack spacing={2}>
      <Icon as={WalletIcon} />
      <Text>Connect Wallet</Text>
    </HStack>
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      header={header}
      body={<ConnectWalletBody onClose={onClose} />}
    />
  )
}

interface IConnectWalletBody {
  onClose: () => void
}
const ConnectWalletBody: React.FC<IConnectWalletBody> = ({ onClose }) => {
  const { dispatch } = useWallet()
  const [connectionLoading, setConnectionLoading] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  const [selectedNetwork, setSelectedNework] =
    useState<Network>(DEFAULT_NETWORK)
  const onNetworkChange = (network: Network) => setSelectedNework(network)

  const [selectedSource, setSelectedSource] =
    useState<WalletSource>(DEFAULT_SOURCE)
  const onSourceChange = (network: WalletSource) => setSelectedSource(network)

  const connectHandler = async () => {
    try {
      setConnectionError("")
      setConnectionLoading(true)
      const cert = await connectToWalletHandler(selectedSource, selectedNetwork)
      dispatch({
        type: ActionType.SET_ALL,
        payload: {
          network: selectedNetwork,
          account: { address: cert.signer, source: selectedSource },
        },
      })
      onClose()
    } catch (e: unknown) {
      const em = getErrorMessage(e)
      console.log(em)
      setConnectionError(em)
    } finally {
      setConnectionLoading(false)
    }
  }

  return (
    <>
      <Flex direction={"column"} gap={8}>
        <Box>
          <Text mb="8px">Network</Text>
          <NetworkSelect
            selected={selectedNetwork}
            onChange={onNetworkChange}
          />
        </Box>
        <Box>
          <Text mb="8px">Wallet</Text>
          <AccountSourceRadio
            selected={selectedSource}
            onChange={onSourceChange}
          />
        </Box>
      </Flex>
      <VStack w="full" spacing={4} mt={8}>
        {connectionLoading && (
          <Alert status="warning">
            <AlertIcon />
            Approve the request in the wallet
          </Alert>
        )}
        {connectionError && (
          <Alert status="error">
            <AlertIcon />
            {connectionError}
          </Alert>
        )}

        <Button
          w="full"
          disabled={connectionLoading}
          onClick={connectHandler}
          colorScheme="blue"
          leftIcon={connectionLoading ? <Spinner /> : <Icon as={LinkIcon} />}
        >
          {connectionLoading ? "Connecting..." : "Connect"}
        </Button>
      </VStack>
    </>
  )
}

export default ConnectWalletModal
