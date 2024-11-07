import Page from "./Page";
import {pageAtom, pages} from "./Util";
import {useAtom} from "jotai";

const Magazine = ({...props}) => {
    const [page] = useAtom(pageAtom);
    
    return (
        <group {...props} rotation-y={-Math.PI /2}> {
            [...pages].map((pageData, index) => (
                <Page
                    page={page}
                    key={index} 
                    number={index}
                    opened={page > index}
                    closed={page === 0 || page === pages.length}
                    {...pageData}
                />
            ))
        }
        </group>
    )
};

export default Magazine;
