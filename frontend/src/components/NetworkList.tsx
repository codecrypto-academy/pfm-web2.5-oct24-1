import React from 'react';

export const NetworkList: React.FC = () => {
            return <div>
                <h3>Networks List</h3>
                <table className="table">
                <thead>
                    <tr>
                    <th scope="col">Chain ID</th>
                    <th scope="col">Status</th>
                    <th scope="col">Start</th>
                    <th scope="col">Stop</th>
                    <th scope="col">Operations</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>1111</td>
                    <td>Down</td>
                    <td>Start</td>
                    <td>Stop</td>
                    <td>Operations</td>
                    </tr>
                    <tr>
                    <td>22222</td>
                    <td>Down</td>
                    <td>Start</td>
                    <td>Stop</td>
                    <td>Operations</td>
                    </tr>
                    <tr>
                    <td >33333</td>
                    <td>Down</td>
                    <td>Start</td>
                    <td>Stop</td>
                    <td>Operations</td>
                    </tr>
                </tbody>
                </table>
            </div>
};