import React from 'react';
import { View, Text } from './Themed';

const ListItem = (props: { item: string }) => {
	return (
		<View style={{ height: 200 }}>
			<Text>LIST Item COMPONENT</Text>
			<Text> {props.item}</Text>
		</View>
	);
};

export default ListItem;
